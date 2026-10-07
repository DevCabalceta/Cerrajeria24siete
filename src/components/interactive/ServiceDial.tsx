import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  animate,
  m,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type Variants,
} from 'motion/react';
import type { ServiceCategory } from '../../data/services';
import { glyphs, type GlyphName } from '../ui/glyphs';
import { ArrowUpRightIcon, WhatsAppIcon } from '../ui/icons';
import { withLazyMotion } from '../../utils/motion';

export interface DialCategory {
  id: ServiceCategory;
  label: string;
  short: string;
  scope: string;
  services: ReadonlyArray<{ title: string; summary: string; href: string }>;
}

interface ServiceDialProps {
  categories: ReadonlyArray<DialCategory>;
  phone: { href: string; display: string };
}

const STEP = 360 / 5; // degrees between specialities on the dial
const C = 200; // dial centre in SVG units
const spring = { type: 'spring', stiffness: 170, damping: 22, mass: 0.9 } as const;
const easePremium = [0.22, 1, 0.36, 1] as const;

const mod = (n: number, m: number) => ((n % m) + m) % m;
const indexFor = (rotation: number, count: number) => mod(Math.round(-rotation / STEP), count);

// Glyph shown in the dial's centre cap for each speciality.
const categoryGlyph: Record<ServiceCategory, GlyphName> = {
  general: 'key',
  residencial: 'house',
  automotriz: 'car',
  'cajas-fuertes': 'safe',
  portones: 'gate',
};

/* ─────────────────────────────────────────────────────────────
   Dial artwork (static geometry, generated once)
   ───────────────────────────────────────────────────────────── */

const TICKS = Array.from({ length: 100 }, (_, i) => {
  const major = i % 10 === 0;
  const mid = i % 5 === 0;
  return { angle: i * 3.6, len: major ? 13 : mid ? 8 : 4.5, opacity: major ? 0.7 : mid ? 0.4 : 0.22 };
});
const KNURL = Array.from({ length: 72 }, (_, i) => i * 5);

function DialFace({ count, active }: { count: number; active: number }) {
  return (
    <>
      <circle cx={C} cy={C} r="182" fill="url(#dial-face)" />
      <circle cx={C} cy={C} r="182" fill="none" stroke="rgb(245 245 241 / 0.08)" />
      {TICKS.map((t) => (
        <line
          key={t.angle}
          x1={C}
          x2={C}
          y1={C - 178}
          y2={C - 178 + t.len}
          stroke="#f5f5f1"
          strokeOpacity={t.opacity}
          strokeWidth="1.2"
          transform={`rotate(${t.angle} ${C} ${C})`}
        />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <text
          key={i}
          x={C}
          y={C - 148}
          textAnchor="middle"
          transform={`rotate(${i * 36} ${C} ${C})`}
          className="fill-paper/55 font-mono"
          style={{ fontSize: 10, letterSpacing: '0.04em' }}
        >
          {i * 10}
        </text>
      ))}
      <circle cx={C} cy={C} r="132" fill="none" stroke="rgb(245 245 241 / 0.08)" />
      {Array.from({ length: count }, (_, i) => {
        const on = i === active;
        return (
          <g key={i} transform={`rotate(${i * STEP} ${C} ${C})`}>
            <circle
              cx={C}
              cy={C - 112}
              r="15"
              className={`transition-[fill,stroke] duration-300 ${on ? 'fill-cobalt stroke-cobalt-bright' : 'fill-paper/[0.05] stroke-paper/20'}`}
            />
            <text
              x={C}
              y={C - 108.5}
              textAnchor="middle"
              className={`font-mono transition-[fill] duration-300 ${on ? 'fill-paper' : 'fill-paper/70'}`}
              style={{ fontSize: 10.5, letterSpacing: '0.04em' }}
            >
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        );
      })}
      {/* Knurled knob */}
      <circle cx={C} cy={C} r="84" fill="url(#dial-knob)" />
      {KNURL.map((a) => (
        <line
          key={a}
          x1={C}
          x2={C}
          y1={C - 84}
          y2={C - 77}
          stroke="rgb(10 15 26 / 0.35)"
          strokeWidth="1.4"
          transform={`rotate(${a} ${C} ${C})`}
        />
      ))}
      <circle cx={C} cy={C - 66} r="3" className="fill-cobalt" />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────── */

const rowVariants: Variants = {
  hide: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: easePremium, delay: 0.05 + i * 0.05 } }),
};
const titleVariants: Variants = {
  hide: { y: '105%' },
  show: { y: '0%', transition: { duration: 0.55, ease: easePremium } },
};

/**
 * Services as a combination dial. Drag it (with inertia and detents), use the
 * arrow keys, the chips or the arrows; each of the five positions is a
 * speciality and the panel lists its real services, each one opening WhatsApp
 * with a pre-written message. All panels are server-rendered for SEO.
 */
function ServiceDial({ categories, phone }: ServiceDialProps) {
  const count = categories.length;
  const reduceMotion = useReducedMotion();
  const rotation = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(0);

  const dialRef = useRef<SVGSVGElement>(null);
  const inView = useInView(dialRef, { once: true, amount: 0.5 });
  const intro = useRef(false);
  const drag = useRef({ on: false, last: 0, t: 0, v: 0 });

  useMotionValueEvent(rotation, 'change', (r) => {
    setPosition(Math.round(mod(-r, 360)));
    if (intro.current) return;
    const next = indexFor(r, count);
    setActive((prev) => {
      if (prev !== next && drag.current.on && 'vibrate' in navigator) navigator.vibrate?.(6);
      return next;
    });
  });

  // Entrance: one full "combination" turn landing on 01.
  useEffect(() => {
    if (!inView || reduceMotion) return;
    intro.current = true;
    rotation.set(360);
    const controls = animate(rotation, 0, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    controls.then(() => {
      intro.current = false;
    });
    return () => controls.stop();
  }, [inView, reduceMotion, rotation]);

  const settleTo = useCallback(
    (target: number) => {
      if (reduceMotion) rotation.set(target);
      else animate(rotation, target, spring);
    },
    [reduceMotion, rotation],
  );

  /** Rotate to a speciality by the shortest path. */
  const goTo = useCallback(
    (index: number) => {
      const current = rotation.get();
      const base = -index * STEP;
      const turns = Math.round((current - base) / 360);
      settleTo(base + turns * 360);
    },
    [rotation, settleTo],
  );

  const step = (dir: 1 | -1) => goTo(mod(indexFor(rotation.get(), count) + dir, count));

  /** Pointer angle around the dial centre: 0° at the top, clockwise. */
  const angleOf = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    return (Math.atan2(x, -y) * 180) / Math.PI;
  };

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture can fail for synthetic pointers; dragging still works without it.
    }
    rotation.stop();
    intro.current = false;
    drag.current = { on: true, last: angleOf(event), t: event.timeStamp, v: 0 };
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d.on) return;
    const angle = angleOf(event);
    let delta = angle - d.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const dt = Math.max((event.timeStamp - d.t) / 1000, 1 / 240);
    d.v = d.v * 0.6 + (delta / dt) * 0.4;
    d.last = angle;
    d.t = event.timeStamp;
    rotation.set(rotation.get() + delta);
  };

  const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    // Project the flick a little, then snap to the nearest detent.
    const projected = rotation.get() + Math.max(-240, Math.min(240, d.v * 0.18));
    settleTo(Math.round(projected / STEP) * STEP);
  };

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => step(1),
      ArrowDown: () => step(1),
      ArrowLeft: () => step(-1),
      ArrowUp: () => step(-1),
      Home: () => goTo(0),
      End: () => goTo(count - 1),
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const current = categories[active];

  return (
    <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-10">
      {/* Dial column */}
      <div className="min-w-0 lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <div className="relative mx-auto w-full max-w-[16rem] sm:max-w-[22rem] lg:max-w-[26rem]">
            {/* Fixed index mark */}
            <svg viewBox="0 0 24 16" className="absolute -top-1 left-1/2 z-10 w-5 -translate-x-1/2" aria-hidden="true">
              <path d="M2 2h20L12 14Z" className="fill-cobalt-bright" />
            </svg>

            <svg
              ref={dialRef}
              viewBox="0 0 400 400"
              role="slider"
              tabIndex={0}
              aria-label="Dial de especialidades"
              aria-valuemin={1}
              aria-valuemax={count}
              aria-valuenow={active + 1}
              aria-valuetext={`${active + 1} de ${count}: ${current.label}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
              className="w-full cursor-grab touch-none rounded-full select-none focus-visible:outline-offset-4 active:cursor-grabbing"
            >
              <defs>
                <radialGradient id="dial-face" cx="50%" cy="38%" r="70%">
                  <stop offset="0" stopColor="#2b3345" />
                  <stop offset="1" stopColor="#111724" />
                </radialGradient>
                <linearGradient id="dial-knob" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#eef0f2" />
                  <stop offset="0.5" stopColor="#b9bfc6" />
                  <stop offset="1" stopColor="#7d858e" />
                </linearGradient>
              </defs>

              <circle cx={C} cy={C} r="198" className="fill-[#151c2a] stroke-paper/10" />
              <m.g style={{ rotate: rotation }}>
                <DialFace count={count} active={active} />
              </m.g>

              {/* Static centre cap with the speciality glyph */}
              <circle cx={C} cy={C} r="56" className="fill-ink" />
              <circle cx={C} cy={C} r="56" fill="none" className="stroke-paper/10" />
              <g transform={`translate(${C - 21} ${C - 21}) scale(1.75)`}>
                {categories.map((category, i) => (
                  <g
                    key={category.id}
                    fill="none"
                    stroke="#f5f5f1"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-opacity duration-300 ${i === active ? 'opacity-100' : 'opacity-0'}`}
                  >
                    {glyphs[categoryGlyph[category.id]]}
                  </g>
                ))}
              </g>
            </svg>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 font-mono text-label text-paper/55 uppercase" aria-hidden="true">
            <span className="tabular-nums">Posición {String(position).padStart(3, '0')}°</span>
            <span className="h-px w-6 bg-paper/20" />
            <span className="tabular-nums">
              {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
          </div>

          <div className="-mx-[clamp(1rem,4vw,2.5rem)] mt-5 flex snap-x gap-2 overflow-x-auto px-[clamp(1rem,4vw,2.5rem)] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            {categories.map((category, i) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={i === active}
                onClick={() => goTo(i)}
                className={`inline-flex h-9 shrink-0 snap-start items-center gap-2 rounded-full px-3.5 text-[0.8125rem] tracking-[-0.01em] transition-colors duration-300 ease-premium ${
                  i === active ? 'bg-paper text-ink' : 'text-paper/70 ring-1 ring-paper/15 ring-inset hover:bg-paper/[0.06] hover:text-paper'
                }`}
              >
                <span className="font-mono text-label">{String(i + 1).padStart(2, '0')}</span>
                {category.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="min-w-0 lg:col-span-7 lg:pt-4" aria-live="polite">
        {categories.map((category, ci) => {
          const isActive = ci === active;
          const titleId = `servicios-${category.id}`;
          return (
            <m.div
              key={category.id}
              data-service-panel
              role="region"
              aria-labelledby={titleId}
              hidden={!isActive}
              initial={false}
              animate={isActive ? 'show' : 'hide'}
              className="lg:min-h-[34rem]"
            >
              <div className="flex items-end justify-between gap-6">
                <div className="min-w-0">
                  <p className="font-mono text-label text-paper/55 uppercase">
                    Especialidad {String(ci + 1).padStart(2, '0')} · {category.services.length}{' '}
                    {category.services.length === 1 ? 'servicio' : 'servicios'}
                  </p>
                  <h3 id={titleId} className="mt-3 overflow-hidden pb-[0.08em]">
                    <m.span
                      variants={titleVariants}
                      className="block text-[clamp(2rem,4vw+0.5rem,3.25rem)] leading-[1] font-medium tracking-[-0.04em]"
                    >
                      {category.label}
                    </m.span>
                  </h3>
                  <p className="mt-3 text-paper/60">{category.scope}</p>
                </div>
                <div className="hidden shrink-0 gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Especialidad anterior"
                    className="grid size-11 place-items-center rounded-full ring-1 ring-paper/15 ring-inset transition-colors duration-300 hover:bg-paper/[0.06]"
                  >
                    <ArrowUpRightIcon className="size-3.5 -rotate-135" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Especialidad siguiente"
                    className="grid size-11 place-items-center rounded-full ring-1 ring-paper/15 ring-inset transition-colors duration-300 hover:bg-paper/[0.06]"
                  >
                    <ArrowUpRightIcon className="size-3.5 rotate-45" />
                  </button>
                </div>
              </div>

              <ul className="mt-8">
                {category.services.map((service, si) => (
                  <m.li key={service.title} custom={si} variants={rowVariants}>
                    <a
                      href={service.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Consultar por WhatsApp: ${service.title}`}
                      className="group/row -mx-3 grid grid-cols-[2.75rem_1fr_auto] items-start gap-x-3 rounded-xl border-t border-paper/10 px-3 py-5 transition-colors duration-300 ease-premium hover:bg-paper/[0.04] sm:grid-cols-[3.5rem_1fr_auto]"
                    >
                      <span className="pt-1 font-mono text-label text-paper/55 tabular-nums">
                        {String(ci + 1).padStart(2, '0')}.{si + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[1.0625rem] leading-snug font-medium tracking-[-0.015em] text-pretty transition-transform duration-500 ease-premium group-hover/row:translate-x-1 sm:text-lg">
                          {service.title}
                        </span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-pretty text-paper/60">{service.summary}</span>
                      </span>
                      <span className="flex items-center gap-2 pt-1 text-paper/55 transition-colors duration-300 group-hover/row:text-paper">
                        <span className="hidden -translate-x-1 text-[0.8125rem] opacity-0 transition-[opacity,translate] duration-500 ease-premium group-hover/row:translate-x-0 group-hover/row:opacity-100 md:inline">
                          Consultar
                        </span>
                        <WhatsAppIcon className="size-4" />
                      </span>
                    </a>
                  </m.li>
                ))}
              </ul>

              <p className="mt-2 border-t border-paper/10 pt-5 text-sm text-paper/60">
                ¿No encuentra lo que necesita? Llámenos al{' '}
                <a href={phone.href} className="link-underline pb-0.5 text-paper tabular-nums">
                  {phone.display}
                </a>
                .
              </p>
            </m.div>
          );
        })}
      </div>
    </div>
  );
}

export default withLazyMotion(ServiceDial);
