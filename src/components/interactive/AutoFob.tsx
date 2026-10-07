import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, MotionConfig, m } from 'motion/react';
import type { AutoMode, AutoModeId } from '../../data/automotive';
import Button from '../ui/Button';
import { withLazyMotion } from '../../utils/motion';

type Mode = AutoMode & { href: string };

interface AutoFobProps {
  modes: ReadonlyArray<Mode>;
  phone: { href: string; display: string };
}

const easePremium = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────────
   Shared bits
   ───────────────────────────────────────────────────────────── */

function StatusPill({ label, done }: { label: string; done: boolean }) {
  return (
    <span className="absolute top-0 right-0 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 font-mono text-label text-ink uppercase ring-1 ring-ink/10">
      <span className={`size-1.5 rounded-full transition-colors duration-500 ${done ? 'bg-live' : 'bg-signal'}`} aria-hidden="true" />
      <AnimatePresence initial={false} mode="popLayout">
        <m.span
          key={label}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.35, ease: easePremium }}
        >
          {label}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

/** Runs a timed sequence of steps, returning the current step index. */
function useSequence(delays: ReadonlyArray<number>) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = delays.map((d, i) => window.setTimeout(() => setStep(i + 1), d));
    return () => timers.forEach(window.clearTimeout);
  }, [delays]);
  return step;
}

const arc = (cx: number, cy: number, r: number, spread = 38) => {
  const a = (spread * Math.PI) / 180;
  return `M${cx + r * Math.cos(-a)} ${cy + r * Math.sin(-a)} A${r} ${r} 0 0 1 ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
};

function Signal({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g>
      {[26, 44, 62].map((r, i) => (
        <m.path
          key={r}
          d={arc(x, y, r)}
          fill="none"
          className="stroke-cobalt"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.7, delay: delay + i * 0.12, repeat: 2, repeatDelay: 0.15 }}
        />
      ))}
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────
   Scenes (viewBox 0 0 480 300)
   ───────────────────────────────────────────────────────────── */

const OPEN_SEQ = [1500] as const;

function CarScene() {
  const open = useSequence(OPEN_SEQ) >= 1;
  const flash = { opacity: [0, 1, 0.1, 1, 0.35] };
  return (
    <>
      <StatusPill label={open ? 'Abierto' : 'Cerrado'} done={open} />
      <svg viewBox="0 0 480 300" className="size-full" aria-hidden="true">
        <line x1="20" x2="460" y1="252" y2="252" className="stroke-ink/15" strokeDasharray="3 6" />
        <Signal x={-4} y={190} />
        {/* Body */}
        <path
          d="M44 206C44 192 54 184 72 181L124 176C146 150 170 132 206 126L298 124C330 124 352 140 374 162L420 171C440 175 448 186 448 202V214C448 220 444 224 438 224H408A32 32 0 0 0 344 224H166A32 32 0 0 0 102 224H54C48 224 44 220 44 214Z"
          className="fill-surface stroke-ink/70"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M142 174C158 152 178 140 206 136L250 135V174Z" className="fill-ink/[0.07] stroke-ink/40" />
        <path d="M262 135H296C316 136 332 147 346 166L347 174H262Z" className="fill-ink/[0.07] stroke-ink/40" />
        <line x1="256" x2="256" y1="132" y2="178" className="stroke-ink/40" />
        <rect x="196" y="186" width="18" height="4" rx="2" className="fill-ink/40" />
        {/* Lights */}
        <m.ellipse cx="441" cy="190" rx="7" ry="5" className="fill-cobalt" initial={{ opacity: 0 }} animate={flash} transition={{ duration: 1.1, delay: 0.45 }} />
        <m.ellipse cx="49" cy="194" rx="5" ry="6" className="fill-signal" initial={{ opacity: 0 }} animate={flash} transition={{ duration: 1.1, delay: 0.45 }} />
        {/* Front door: pops open once unlocked */}
        <rect x="257" y="178" width="98" height="44" className="fill-ink" opacity={open ? 0.85 : 0} style={{ transition: 'opacity 400ms' }} />
        <m.g
          initial={false}
          animate={open ? { x: 14, y: -4, rotate: -3 } : { x: 0, y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 16 }}
          style={{ originX: 0, originY: 0.5 }}
        >
          <path d="M256 178H355V214C355 219 352 222 347 222H256Z" className="fill-surface stroke-ink/70" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="316" y="186" width="18" height="4" rx="2" className="fill-ink/50" />
        </m.g>
        {/* Wheels */}
        {[134, 376].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="226" r="26" className="fill-ink" />
            <circle cx={cx} cy="226" r="11" fill="url(#af-steel)" />
          </g>
        ))}
      </svg>
    </>
  );
}

const CHIP_SEQ = [600, 1200, 1800, 2300] as const;

function ChipScene() {
  const step = useSequence(CHIP_SEQ);
  const done = step >= 4;
  return (
    <>
      <StatusPill label={done ? 'Llave programada' : `Emparejando ${Math.min(step + 1, 3)}/3`} done={done} />
      <svg viewBox="0 0 480 300" className="size-full" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <m.circle
            key={i}
            cx="190"
            cy="150"
            r="30"
            fill="none"
            className="stroke-cobalt"
            strokeWidth="1.5"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={done ? { scale: 1, opacity: 0 } : { scale: [0.6, 3.4], opacity: [0.9, 0] }}
            transition={{ duration: 1.8, delay: i * 0.6, repeat: done ? 0 : Infinity, ease: 'easeOut' }}
          />
        ))}
        {/* Key head */}
        <rect x="120" y="92" width="140" height="116" rx="44" className="fill-ink" />
        <rect x="120" y="92" width="140" height="116" rx="44" fill="none" stroke="rgb(255 255 255 / 0.08)" />
        <circle cx="140" cy="150" r="9" className="fill-paper" />
        {/* Blade */}
        <path d="M260 136H408L420 150L408 164H260Z" fill="url(#af-steel)" className="stroke-ink/30" />
        <path d="M272 150C284 143 296 157 308 150S332 143 344 150S368 157 392 150" fill="none" className="stroke-ink/35" strokeWidth="1.5" />
        {/* Transponder */}
        <rect x="172" y="132" width="36" height="36" rx="5" className={done ? 'fill-cobalt' : 'fill-ink-soft'} style={{ transition: 'fill 500ms' }} stroke="rgb(255 255 255 / 0.25)" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} className="stroke-paper/50" strokeWidth="1.5">
            <line x1={178 + i * 8} x2={178 + i * 8} y1="127" y2="132" />
            <line x1={178 + i * 8} x2={178 + i * 8} y1="168" y2="173" />
          </g>
        ))}
        <text x="190" y="196" textAnchor="middle" className="fill-paper/70 font-mono" style={{ fontSize: 8, letterSpacing: '0.12em' }}>
          CHIP
        </text>
        {/* Progress pips */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={300 + i * 24} y="222" width="18" height="4" rx="2" className={step > i ? 'fill-cobalt' : 'fill-ink/15'} style={{ transition: 'fill 300ms' }} />
        ))}
      </svg>
    </>
  );
}

const PARTS = [
  { label: 'Forro', x: 70 },
  { label: 'Carcasa', x: 180 },
  { label: 'Circuito', x: 290 },
  { label: 'Tapa', x: 400 },
] as const;

function PartShape({ index }: { index: number }) {
  const body = <rect x="-40" y="-70" width="80" height="140" rx="32" />;
  switch (index) {
    case 0:
      return (
        <g className="fill-cobalt/15 stroke-cobalt" strokeWidth="1.6" strokeDasharray="4 3">
          {body}
        </g>
      );
    case 1:
      return (
        <g>
          <g className="fill-ink">{body}</g>
          {[-34, -6, 22].map((y) => (
            <circle key={y} cx="0" cy={y} r="11" className="fill-paper/10 stroke-paper/20" />
          ))}
        </g>
      );
    case 2:
      return (
        <g>
          <rect x="-34" y="-60" width="68" height="120" rx="10" className="fill-cobalt-soft stroke-ink/30" />
          <rect x="-12" y="-14" width="24" height="24" rx="3" className="fill-ink" />
          <path d="M-24 -46H12V-30M-24 30H18V46M24 -44V-20" fill="none" className="stroke-ink/40" strokeWidth="1.5" />
          <circle cx="-18" cy="-30" r="3" className="fill-ink/50" />
          <circle cx="16" cy="28" r="3" className="fill-ink/50" />
        </g>
      );
    default:
      return <g className="fill-ink-soft">{body}</g>;
  }
}

function ShellScene() {
  return (
    <>
      <StatusPill label={`${PARTS.length} piezas`} done />
      <svg viewBox="0 0 480 300" className="size-full" aria-hidden="true">
        {PARTS.map((part, i) => (
          <m.g
            key={part.label}
            initial={{ x: 240, y: 130, opacity: 0.6 }}
            animate={{ x: part.x, y: 130, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 17, delay: 0.15 + (PARTS.length - i) * 0.06 }}
          >
            <PartShape index={i} />
            <line x1="0" x2="0" y1="80" y2="104" className="stroke-ink/30" />
            <circle cx="0" cy="80" r="2" className="fill-ink/40" />
            <text x="0" y="122" textAnchor="middle" className="fill-ink/80 font-mono" style={{ fontSize: 11, letterSpacing: '0.08em' }}>
              {part.label.toUpperCase()}
            </text>
          </m.g>
        ))}
      </svg>
    </>
  );
}

const IGN_POSITIONS = [
  { label: 'LOCK', angle: -60 },
  { label: 'ACC', angle: -20 },
  { label: 'ON', angle: 20 },
  { label: 'START', angle: 60 },
] as const;
const IGN_SEQ = [550, 1100, 1650] as const;

function IgnitionScene() {
  const step = useSequence(IGN_SEQ);
  // LOCK → ACC → ON, with a brief START before settling back to ON.
  const angles = [-60, -20, 20, 60];
  const pos = step === 3 ? 2 : step;
  const angle = step === 3 ? 20 : angles[step];
  const on = step >= 2;
  return (
    <>
      <StatusPill label={step >= 3 ? 'Encendido' : IGN_POSITIONS[pos].label} done={step >= 3} />
      <svg viewBox="0 0 480 300" className="size-full" aria-hidden="true">
        <circle cx="240" cy="140" r="104" fill="url(#af-steel)" className="stroke-ink/20" />
        <circle cx="240" cy="140" r="84" className="fill-surface stroke-ink/15" />
        {IGN_POSITIONS.map((p, i) => {
          const a = ((p.angle - 90) * Math.PI) / 180;
          const active = i === pos;
          return (
            <g key={p.label}>
              <line
                x1={240 + 90 * Math.cos(a)}
                y1={140 + 90 * Math.sin(a)}
                x2={240 + 100 * Math.cos(a)}
                y2={140 + 100 * Math.sin(a)}
                className={active ? 'stroke-cobalt' : 'stroke-ink/40'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <text
                x={240 + 124 * Math.cos(a)}
                y={140 + 124 * Math.sin(a) + 4}
                textAnchor="middle"
                className={`font-mono transition-[fill] duration-300 ${active ? 'fill-cobalt' : 'fill-ink/60'}`}
                style={{ fontSize: 11, letterSpacing: '0.08em' }}
              >
                {p.label}
              </text>
            </g>
          );
        })}
        {/* Plug + key, turning together */}
        <m.g
          initial={false}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 140, damping: step === 3 ? 9 : 18 }}
        >
          <circle cx="240" cy="140" r="52" className="fill-paper stroke-ink/20" />
          <rect x="226" y="70" width="28" height="140" rx="10" className="fill-ink" />
          <circle cx="240" cy="86" r="5" className="fill-paper" />
          <rect x="236" y="118" width="8" height="44" rx="2" className="fill-cobalt" />
        </m.g>
        {/* Dashboard tell-tales */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={200 + i * 20}
            cy="272"
            r="4"
            className={on ? (i === 2 ? 'fill-live' : 'fill-cobalt') : 'fill-ink/15'}
            style={{ transition: `fill 300ms ${i * 60}ms` }}
          />
        ))}
      </svg>
    </>
  );
}

const SCENES: Record<AutoModeId, () => ReactNode> = {
  abrir: CarScene,
  chip: ChipScene,
  carcasa: ShellScene,
  ignicion: IgnitionScene,
};

/* ─────────────────────────────────────────────────────────────
   Fob buttons
   ───────────────────────────────────────────────────────────── */

const fobIcons: Record<AutoModeId, ReactNode> = {
  abrir: (
    <>
      <rect x="5.5" y="11" width="13" height="9.5" rx="2.25" fill="currentColor" stroke="none" />
      <path d="M8 11V8a4 4 0 0 1 7.6-1.7" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" />
    </>
  ),
  carcasa: (
    <>
      <rect x="7" y="3.5" width="10" height="17" rx="4.5" />
      <path d="M10 9h4M10 13h4" />
    </>
  ),
  ignicion: (
    <>
      <path d="M12 3.5v7" />
      <path d="M7.2 6.5a7 7 0 1 0 9.6 0" />
    </>
  ),
};

/**
 * Automotive section driven by a key fob. Each button is a real service and
 * plays a small simulation on the stage: unlocking a (generic, brandless) car,
 * pairing a transponder, an exploded fob, and an ignition turning on.
 */
function AutoFob({ modes, phone }: AutoFobProps) {
  const [active, setActive] = useState<AutoModeId>(modes[0].id);
  const [presses, setPresses] = useState(0);
  const mode = modes.find((option) => option.id === active) ?? modes[0];
  const index = modes.indexOf(mode);
  const Scene = SCENES[mode.id];

  const press = (id: AutoModeId) => {
    setActive(id);
    setPresses((n) => n + 1);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
        {/* Fob */}
        <div className="flex justify-center lg:order-1">
          <div
            role="group"
            aria-label="Control: elija un servicio automotriz"
            className="relative flex items-center gap-2 rounded-full bg-[linear-gradient(160deg,#2a3242,#0a0f1a_70%)] p-2.5 shadow-[0_24px_48px_-24px_rgb(10_15_26/0.6)] ring-1 ring-ink/40 sm:gap-3 sm:p-3 lg:flex-col lg:rounded-[3.25rem] lg:px-4 lg:pt-10 lg:pb-6"
          >
            {/* Key ring loop and LED */}
            <span aria-hidden="true" className="absolute -top-7 left-1/2 hidden size-9 -translate-x-1/2 rounded-full border-[3px] border-[#a8aeb4] lg:block" />
            <m.span
              key={presses}
              aria-hidden="true"
              className="absolute top-1/2 -left-1 size-1.5 -translate-y-1/2 rounded-full bg-cobalt-bright lg:top-4 lg:left-1/2 lg:-translate-x-1/2 lg:translate-y-0"
              initial={{ opacity: presses ? 1 : 0.25 }}
              animate={{ opacity: 0.25 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
            {modes.map((option) => {
              const on = option.id === active;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => press(option.id)}
                  className="group/fob flex flex-col items-center gap-1.5 rounded-full focus-visible:outline-paper"
                >
                  <span
                    className={`grid size-14 place-items-center rounded-full transition-[background-color,box-shadow,scale] duration-300 ease-premium group-active/fob:scale-90 sm:size-16 ${
                      on
                        ? 'bg-paper text-ink shadow-[0_0_0_4px_rgb(124_156_255/0.35)]'
                        : 'bg-white/[0.06] text-paper ring-1 ring-white/10 ring-inset group-hover/fob:bg-white/[0.12]'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {fobIcons[option.id]}
                    </svg>
                  </span>
                  <span className={`font-mono text-[0.625rem] tracking-[0.08em] uppercase ${on ? 'text-paper' : 'text-paper/70'}`}>{option.button}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage */}
        <figure className="relative lg:order-2">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(10_15_26/0.12)_1px,transparent_1.3px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" aria-hidden="true" />
          <figcaption className="flex items-center justify-between font-mono text-label text-muted uppercase">
            <span>
              Fig. 04 — Modo {String(index + 1).padStart(2, '0')}/{String(modes.length).padStart(2, '0')}
            </span>
          </figcaption>
          <div className="relative mt-4 aspect-[8/5]">
            <svg width="0" height="0" className="absolute" aria-hidden="true">
              <defs>
                <linearGradient id="af-steel" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f3f4f4" />
                  <stop offset="0.5" stopColor="#c9cdd1" />
                  <stop offset="1" stopColor="#9aa1a8" />
                </linearGradient>
              </defs>
            </svg>
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={`${mode.id}-${presses}`}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.01, filter: 'blur(4px)' }}
                transition={{ duration: 0.35, ease: easePremium }}
              >
                <Scene />
              </m.div>
            </AnimatePresence>
          </div>
        </figure>

        {/* Detail panel */}
        <div className="lg:order-3" aria-live="polite">
          <p className="font-mono text-label text-muted uppercase">
            Servicio {String(index + 1).padStart(2, '0')}
          </p>
          <h3 className="relative mt-3 overflow-hidden pb-[0.08em]">
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
                key={mode.id}
                className="block text-[clamp(1.75rem,2.6vw+0.75rem,2.75rem)] leading-[1.02] font-medium tracking-[-0.04em]"
                initial={{ y: '105%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-105%' }}
                transition={{ duration: 0.5, ease: easePremium }}
              >
                {mode.title}
              </m.span>
            </AnimatePresence>
          </h3>
          <p className="mt-4 max-w-[32rem] text-pretty text-muted">{mode.text}</p>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 font-mono text-label text-ink uppercase">
            {mode.tags.map((tag) => (
              <li key={tag} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-cobalt" aria-hidden="true" />
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button href={mode.href} icon="whatsapp" arrow external size="lg">
              Consultar por WhatsApp
            </Button>
            <a href={phone.href} className="text-sm text-ink">
              <span className="link-underline pb-0.5 tabular-nums">o llame al {phone.display}</span>
            </a>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

export default withLazyMotion(AutoFob);
