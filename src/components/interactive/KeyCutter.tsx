import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from 'motion/react';
import type { Reason } from '../../data/reasons';
import { useHydrated } from '../../utils/useHydrated';
import { withLazyMotion } from '../../utils/motion';

interface KeyCutterProps {
  reasons: ReadonlyArray<Reason>;
}

/* ─────────────────────────────────────────────────────────────
   Duplicator geometry (viewBox 0 0 600 270)
   ───────────────────────────────────────────────────────────── */

const TOP = 150; // uncut blade edge
const BOTTOM = 196;
const BLADE_START = 150;
const BLADE_END = 540;
const TEETH = [215, 280, 345, 410, 475];
const DEPTH = [14, 24, 10, 20, 16];
const HALF = 15;
const FLAT = 3;
const R = 34; // cutter wheel radius
const RAISED = TOP - R - 16;
const easePremium = [0.22, 1, 0.36, 1] as const;

function bladePath(cuts: number[]) {
  let d = `M${BLADE_START} ${TOP}`;
  TEETH.forEach((x, i) => {
    const depth = DEPTH[i] * cuts[i];
    d += ` L${x - HALF} ${TOP} L${x - FLAT} ${TOP + depth} L${x + FLAT} ${TOP + depth} L${x + HALF} ${TOP}`;
  });
  return `${d} L${BLADE_END} ${TOP} L556 162 L556 184 L${BLADE_END} ${BOTTOM} L${BLADE_START} ${BOTTOM} Z`;
}

const WHEEL_TEETH = Array.from({ length: 24 }, (_, i) => (i / 24) * Math.PI * 2);
const SPARKS = [-150, -125, -100, -70, -45, -20];

/**
 * "Why choose us" as a key duplicator: on first view the cutter mills one
 * tooth per reason — each reason lights up as its tooth is cut — until the
 * key is ready. Afterwards, hovering a reason brings the cutter to its tooth.
 */
function KeyCutter({ reasons }: KeyCutterProps) {
  const reduce = useReducedMotion();
  // Server render, no-JS and reduced motion all show the finished key.
  const animated = useHydrated() && !reduce;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });

  const c0 = useMotionValue(1);
  const c1 = useMotionValue(1);
  const c2 = useMotionValue(1);
  const c3 = useMotionValue(1);
  const c4 = useMotionValue(1);
  const cuts = useMemo(() => [c0, c1, c2, c3, c4], [c0, c1, c2, c3, c4]);
  const blade = useTransform(cuts, (values: number[]) => bladePath(values));

  const cutterX = useMotionValue(TEETH[TEETH.length - 1]);
  const wheelY = useMotionValue(RAISED);
  const spin = useMotionValue(0);

  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [cutting, setCutting] = useState(false);
  const sequenceDone = useRef(true);
  const cutCount = animated ? progress : reasons.length;

  // Animated: start from a blank key with the cutter parked to the left.
  useEffect(() => {
    if (!animated) return;
    cuts.forEach((c) => c.set(0));
    cutterX.set(TEETH[0] - 90);
    sequenceDone.current = false;
  }, [animated, cuts, cutterX]);

  useEffect(() => {
    if (!inView || !animated || sequenceDone.current) return;
    let cancelled = false;
    let spinning: AnimationPlaybackControls | null = null;

    (async () => {
      await new Promise((r) => setTimeout(r, 300));
      for (let i = 0; i < TEETH.length && !cancelled; i++) {
        setActive(i);
        await animate(cutterX, TEETH[i], { duration: 0.35, ease: easePremium });
        if (cancelled) return;
        setCutting(true);
        spinning = animate(spin, spin.get() + 360 * 6, { duration: 1.2, ease: 'linear' });
        await animate(wheelY, TOP - R, { duration: 0.12, ease: 'easeOut' });
        await Promise.all([
          animate(cuts[i], 1, { duration: 0.42, ease: 'easeInOut' }),
          animate(wheelY, TOP - R + DEPTH[i], { duration: 0.42, ease: 'easeInOut' }),
        ]);
        setProgress(i + 1);
        setCutting(false);
        spinning.stop();
        await animate(wheelY, RAISED, { duration: 0.2, ease: easePremium });
      }
      if (cancelled) return;
      sequenceDone.current = true;
      setActive(null);
    })();

    return () => {
      cancelled = true;
      spinning?.stop();
    };
  }, [inView, animated, cuts, cutterX, spin, wheelY]);

  const visit = (i: number) => {
    if (!sequenceDone.current) return;
    setActive(i);
    if (!animated) {
      cutterX.set(TEETH[i]);
      return;
    }
    animate(cutterX, TEETH[i], { duration: 0.45, ease: easePremium });
    animate(wheelY, [RAISED, TOP - R + DEPTH[i] - 3, RAISED], { duration: 0.7, ease: 'easeInOut', delay: 0.25 });
    animate(spin, spin.get() + 360, { duration: 0.9, ease: 'easeOut' });
  };

  const isReady = cutCount === reasons.length;
  const status = isReady ? 'Llave lista' : cutting ? 'Cortando…' : `Diente ${String((active ?? 0) + 1).padStart(2, '0')}/05`;
  const contactY = useTransform(wheelY, (y) => y + R);

  return (
    <div ref={ref} className="grid gap-y-10 lg:grid-cols-12 lg:items-center lg:gap-x-10">
      <figure className="min-w-0 lg:col-span-7">
        <div className="flex items-center justify-between font-mono text-label text-muted uppercase">
          <span>Fig. 07 — Duplicadora</span>
          <span className="flex items-center gap-2 text-ink" aria-live="polite">
            <span className={`size-1.5 rounded-full ${isReady ? 'bg-live' : 'bg-cobalt'}`} aria-hidden="true" />
            {status}
          </span>
        </div>
        <svg viewBox="0 0 600 270" className="mt-4 w-full" role="img" aria-label="Duplicadora cortando los cinco dientes de una llave.">
          <defs>
            <linearGradient id="kc-steel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f3f4f4" />
              <stop offset="0.55" stopColor="#c9cdd1" />
              <stop offset="1" stopColor="#9aa1a8" />
            </linearGradient>
          </defs>

          {/* Bench */}
          <line x1="0" x2="600" y1="246" y2="246" className="stroke-ink/15" strokeDasharray="3 6" />
          {/* Cutting guide marks */}
          {TEETH.map((x, i) => (
            <g key={x}>
              <line x1={x} x2={x} y1="206" y2="222" className={i < cutCount ? 'stroke-cobalt' : 'stroke-ink/25'} strokeWidth="1.5" />
              <text x={x} y="236" textAnchor="middle" className={`font-mono ${i < cutCount ? 'fill-cobalt' : 'fill-ink/45'}`} style={{ fontSize: 9, letterSpacing: '0.08em' }}>
                {String(i + 1).padStart(2, '0')}
              </text>
            </g>
          ))}

          {/* Key */}
          <path fillRule="evenodd" d="M34 173a38 38 0 1 0 76 0a38 38 0 1 0 -76 0Z M60 173a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z" fill="url(#kc-steel)" className="stroke-ink/30" />
          <rect x="108" y="160" width="44" height="28" rx="4" fill="url(#kc-steel)" className="stroke-ink/30" />
          <m.path d={blade} fill="url(#kc-steel)" className="stroke-ink/40" strokeLinejoin="round" />
          <path d={`M${BLADE_START + 10} 182H530`} className="stroke-ink/15" strokeWidth="2" />

          {/* Vise jaws */}
          <rect x="114" y="122" width="40" height="28" rx="4" className="fill-ink" />
          <rect x="114" y="196" width="40" height="30" rx="4" className="fill-ink" />
          <circle cx="134" cy="136" r="4" className="fill-paper/30" />

          {/* Cutter carriage + wheel */}
          <m.line x1={cutterX} x2={cutterX} y1="0" y2={wheelY} className="stroke-ink" strokeWidth="10" strokeLinecap="round" />
          <m.g style={{ x: cutterX, y: wheelY }}>
            <m.g style={{ rotate: spin }}>
              <circle cx="0" cy="0" r={R} className="fill-ink-soft" />
              {WHEEL_TEETH.map((a) => (
                <line
                  key={a}
                  x1={(R - 6) * Math.cos(a)}
                  y1={(R - 6) * Math.sin(a)}
                  x2={(R + 2) * Math.cos(a)}
                  y2={(R + 2) * Math.sin(a)}
                  className="stroke-[#c9cdd1]"
                  strokeWidth="2.5"
                />
              ))}
              <circle cx="0" cy="0" r="9" className="fill-paper" />
              <circle cx="0" cy="0" r="3" className="fill-ink" />
            </m.g>
          </m.g>

          {/* Sparks at the contact point */}
          <AnimatePresence>
            {cutting && (
              <m.g key="sparks" style={{ x: cutterX, y: contactY }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {SPARKS.map((deg, i) => {
                  const a = (deg * Math.PI) / 180;
                  return (
                    <m.line
                      key={deg}
                      x1="0"
                      y1="0"
                      x2={18 * Math.cos(a)}
                      y2={18 * Math.sin(a)}
                      className="stroke-cobalt"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 1 }}
                      animate={{ pathLength: [0, 1], opacity: [1, 0] }}
                      transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.05 }}
                    />
                  );
                })}
              </m.g>
            )}
          </AnimatePresence>
        </svg>
      </figure>

      <ol className="min-w-0 lg:col-span-5">
        {reasons.map((reason, i) => {
          const cut = i < cutCount;
          const on = active === i;
          return (
            <li
              key={reason.title}
              onPointerEnter={() => visit(i)}
              className="relative grid grid-cols-[2.5rem_1fr] gap-x-3 border-t border-line py-5 last:border-b"
            >
              <span
                aria-hidden="true"
                className={`absolute top-0 left-0 h-px origin-left bg-cobalt transition-transform duration-700 ease-premium ${on ? 'w-full scale-x-100' : 'w-full scale-x-0'}`}
              />
              <span className={`pt-1 font-mono text-label tabular-nums transition-colors duration-500 ${on ? 'text-cobalt' : 'text-muted'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>
                <span className={`block text-lg leading-snug font-medium tracking-[-0.015em] transition-colors duration-500 ${cut ? 'text-ink' : 'text-muted'}`}>
                  {reason.title}
                </span>
                <span className="mt-1 block text-sm text-pretty text-muted">{reason.text}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default withLazyMotion(KeyCutter);
