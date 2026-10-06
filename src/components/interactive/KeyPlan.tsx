import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useSpring, useTransform } from 'motion/react';
import type { DoorId, ResidentialMode, ResidentialModeId } from '../../data/residential';
import Button from '../ui/Button';

type Mode = ResidentialMode & { href: string };
type DoorState = 'locked' | 'open' | 'denied';

interface KeyPlanProps {
  modes: ReadonlyArray<Mode>;
  extras: string;
  phone: { href: string; display: string };
}

const easePremium = [0.22, 1, 0.36, 1] as const;
const rad = (deg: number) => (deg * Math.PI) / 180;

/* ─────────────────────────────────────────────────────────────
   Floor plan geometry (viewBox 0 0 560 360)
   ───────────────────────────────────────────────────────────── */

interface DoorSpec {
  id: DoorId;
  code: string;
  hinge: [number, number];
  len: number;
  closed: number;
  open: number;
  badge: [number, number];
}

const DOORS: ReadonlyArray<DoorSpec> = [
  { id: 'entrada', code: 'P1', hinge: [120, 330], len: 60, closed: 0, open: -82, badge: [150, 352] },
  { id: 'oficina', code: 'P2', hinge: [150, 170], len: 50, closed: 0, open: -82, badge: [175, 190] },
  { id: 'habitacion', code: 'P3', hinge: [360, 190], len: 50, closed: 0, open: -82, badge: [385, 210] },
  { id: 'bodega', code: 'P4', hinge: [400, 260], len: 45, closed: 90, open: 8, badge: [380, 282] },
];

const WALLS = [
  // Outer shell (entrance gap 120–180 on the bottom wall)
  'M30 30H530V330H180M120 330H30V30',
  // Oficina
  'M30 170H150M200 170H220V30',
  // Habitación
  'M340 30V190H360M410 190H530',
  // Bodega
  'M400 250H530M400 250V260M400 305V330',
];

const ROOMS = [
  { label: 'Oficina', x: 125, y: 104 },
  { label: 'Habitación', x: 435, y: 112 },
  { label: 'Sala', x: 250, y: 262 },
  { label: 'Bodega', x: 466, y: 294 },
];

function Door({ spec, state }: { spec: DoorSpec; state: DoorState }) {
  const reduce = useReducedMotion();
  const angle = useSpring(spec.closed, { stiffness: 150, damping: 17 });
  useEffect(() => {
    const target = state === 'open' ? spec.open : spec.closed;
    if (reduce) angle.jump(target);
    else angle.set(target);
  }, [state, spec, angle, reduce]);

  const [hx, hy] = spec.hinge;
  const x2 = useTransform(angle, (a) => hx + spec.len * Math.cos(rad(a)));
  const y2 = useTransform(angle, (a) => hy + spec.len * Math.sin(rad(a)));

  const a0 = rad(spec.closed);
  const a1 = rad(spec.open);
  const sweep = spec.open < spec.closed ? 0 : 1;
  const swing = `M${hx + spec.len * Math.cos(a0)} ${hy + spec.len * Math.sin(a0)} A${spec.len} ${spec.len} 0 0 ${sweep} ${hx + spec.len * Math.cos(a1)} ${hy + spec.len * Math.sin(a1)}`;
  const wedge = `M${hx} ${hy} L${hx + spec.len * Math.cos(a0)} ${hy + spec.len * Math.sin(a0)} A${spec.len} ${spec.len} 0 0 ${sweep} ${hx + spec.len * Math.cos(a1)} ${hy + spec.len * Math.sin(a1)} Z`;

  const open = state === 'open';
  const denied = state === 'denied';
  const [bx, by] = spec.badge;

  return (
    <g>
      <path d={wedge} className={`transition-[fill-opacity] duration-500 ${open ? 'fill-cobalt' : 'fill-ink'}`} fillOpacity={open ? 0.1 : 0} />
      <path d={swing} fill="none" className={open ? 'stroke-cobalt' : 'stroke-ink/30'} strokeDasharray="3 4" strokeWidth="1.2" />
      <motion.line x1={hx} y1={hy} x2={x2} y2={y2} className={open ? 'stroke-cobalt' : 'stroke-ink'} strokeWidth="4" strokeLinecap="round" />
      <circle cx={hx} cy={hy} r="3.5" className="fill-paper stroke-ink" strokeWidth="1.5" />
      {/* Lock badge */}
      <motion.g
        initial={false}
        animate={denied ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
      >
        <circle
          cx={bx}
          cy={by}
          r="11"
          className={`transition-[fill] duration-300 ${open ? 'fill-cobalt' : denied ? 'fill-signal' : 'fill-ink'}`}
        />
        <path
          d={open ? `M${bx - 3} ${by - 1}v-3a3 3 0 0 1 5.7-1.3` : `M${bx - 3} ${by - 1}v-2.5a3 3 0 0 1 6 0V${by - 1}`}
          fill="none"
          className="stroke-paper"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <rect x={bx - 4.5} y={by - 1} width="9" height="6.5" rx="1.5" className="fill-paper" />
      </motion.g>
      <text x={bx + 16} y={by + 4} className="fill-ink/70 font-mono" style={{ fontSize: 11, letterSpacing: '0.06em' }}>
        {spec.code}
      </text>
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────
   Combination-change sequence
   ───────────────────────────────────────────────────────────── */

const CHANGE_STEPS = [
  { at: 0, entrada: 'open', status: 'Llave anterior: abre', code: '3·5·2·6·4' },
  { at: 1200, entrada: 'locked', status: 'Cambiando combinación…', code: '—·—·—·—·—' },
  { at: 2300, entrada: 'denied', status: 'Llave anterior: no abre', code: '4·1·6·2·5' },
  { at: 3400, entrada: 'open', status: 'Llave nueva: abre', code: '4·1·6·2·5' },
] as const;

/** Schedules the remaining steps; the reset to step 0 happens in the click handler. */
function useChangeTimers(active: boolean, run: number, setStep: (step: number) => void) {
  useEffect(() => {
    if (!active) return;
    const timers = CHANGE_STEPS.slice(1).map((s, i) => window.setTimeout(() => setStep(i + 1), s.at));
    return () => timers.forEach(window.clearTimeout);
  }, [active, run, setStep]);
}

/* ─────────────────────────────────────────────────────────────
   Key glyph for the selector
   ───────────────────────────────────────────────────────────── */

const tagClass: Record<ResidentialModeId, string> = {
  apertura: 'fill-transparent stroke-ink/40',
  individual: 'fill-ink-soft',
  maestra: 'fill-cobalt',
  cambio: 'fill-signal',
};

function KeyGlyph({ id, active }: { id: ResidentialModeId; active: boolean }) {
  if (id === 'apertura') {
    return (
      <svg viewBox="0 0 40 40" className="size-10 shrink-0" aria-hidden="true">
        <circle cx="20" cy="20" r="15" className="fill-none stroke-ink/30" strokeDasharray="3 3" />
        <path d="M14 26 26 14M26 14h-6M26 14v6" fill="none" className="stroke-ink" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" className="size-10 shrink-0" aria-hidden="true">
      <g className={`transition-transform duration-500 ease-spring ${active ? '-translate-y-0.5 -rotate-12' : ''}`} style={{ transformOrigin: '20px 20px' }}>
        <rect x="6" y="11" width="10" height="16" rx="3" className={tagClass[id]} />
        <circle cx="11" cy="15" r="1.6" className="fill-paper" />
        <circle cx="22" cy="20" r="5.5" fill="none" className="stroke-ink" strokeWidth="1.8" />
        <path d="M27.5 20H36M33 20v3.5M30.5 20v2.5" fill="none" className="stroke-ink" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────── */

/**
 * Residential section as an architectural plan. Pick a key (or none) and the
 * plan shows which doors it opens — individual keys open one door, the master
 * opens all — and the combination change plays out step by step.
 */
export default function KeyPlan({ modes, extras, phone }: KeyPlanProps) {
  const [active, setActive] = useState<ResidentialModeId>('maestra');
  const [run, setRun] = useState(0);
  const [changeStep, setChangeStep] = useState(0);
  const mode = modes.find((m) => m.id === active) ?? modes[0];
  useChangeTimers(active === 'cambio', run, setChangeStep);
  const change = CHANGE_STEPS[changeStep];

  const stateOf = (door: DoorId): DoorState => {
    if (active === 'cambio') return door === 'entrada' ? change.entrada : 'locked';
    return mode.opens.includes(door) ? 'open' : 'locked';
  };

  const openCount = DOORS.filter((d) => stateOf(d.id) === 'open').length;
  const status =
    active === 'cambio'
      ? change.status
      : active === 'apertura'
        ? 'Apertura de la entrada'
        : `Abre ${openCount} de ${DOORS.length} puertas`;

  const select = (id: ResidentialModeId) => {
    setActive(id);
    setChangeStep(0);
    setRun((n) => n + 1);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
        {/* Plan */}
        <figure className="min-w-0 lg:col-span-7">
          <div className="flex items-center justify-between gap-4 font-mono text-label text-muted uppercase">
            <span>Fig. 05 — Plano de accesos</span>
            <span className="flex items-center gap-2 text-ink" aria-live="polite">
              <span className={`size-1.5 rounded-full ${openCount > 0 ? 'bg-live' : 'bg-signal'}`} aria-hidden="true" />
              {status}
            </span>
          </div>
          <div className="relative mt-4 rounded-[1.25rem] bg-surface p-3 ring-1 ring-ink/[0.06] sm:p-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[1.25rem] bg-[linear-gradient(rgb(10_15_26/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(10_15_26/0.045)_1px,transparent_1px)] bg-[size:20px_20px]"
            />
            <svg
              viewBox="0 0 560 370"
              className="relative w-full"
              role="img"
              aria-label={`Plano con cuatro puertas: entrada, oficina, habitación y bodega. ${status}.`}
            >
              {WALLS.map((d) => (
                <path key={d} d={d} fill="none" className="stroke-ink" strokeWidth="7" strokeLinecap="square" strokeLinejoin="miter" />
              ))}
              {ROOMS.map((room) => (
                <text
                  key={room.label}
                  x={room.x}
                  y={room.y}
                  textAnchor="middle"
                  className="fill-ink/55 font-mono"
                  style={{ fontSize: 13, letterSpacing: '0.1em' }}
                >
                  {room.label.toUpperCase()}
                </text>
              ))}
              {DOORS.map((door) => (
                <Door key={door.id} spec={door} state={stateOf(door.id)} />
              ))}
            </svg>

            {active === 'cambio' && (
              <div className="absolute right-4 bottom-4 rounded-full bg-ink px-3 py-1.5 font-mono text-label text-paper uppercase tabular-nums sm:right-6 sm:bottom-6">
                Combinación {change.code}
              </div>
            )}
          </div>
        </figure>

        {/* Selector + detail */}
        <div className="min-w-0 lg:col-span-5">
          <div role="group" aria-label="Elija una llave" className="grid grid-cols-2 gap-2">
            {modes.map((m) => {
              const on = m.id === active;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => select(m.id)}
                  className={`group/key flex items-center gap-3 rounded-2xl p-3 text-left transition-[background-color,box-shadow] duration-300 ease-premium ${
                    on ? 'bg-surface shadow-[0_10px_30px_-18px_rgb(10_15_26/0.45)] ring-1 ring-ink/10' : 'ring-1 ring-ink/10 ring-inset hover:bg-surface/60'
                  }`}
                >
                  <KeyGlyph id={m.id} active={on} />
                  <span className="min-w-0">
                    <span className="block text-sm leading-tight font-medium tracking-[-0.01em] text-ink">{m.label}</span>
                    <span className="mt-0.5 block font-mono text-[0.625rem] tracking-[0.06em] text-muted uppercase">{m.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <h3 className="relative overflow-hidden pb-[0.08em]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={mode.id}
                  className="block text-[clamp(1.75rem,2.4vw+0.75rem,2.5rem)] leading-[1.04] font-medium tracking-[-0.04em]"
                  initial={{ y: '105%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '-105%' }}
                  transition={{ duration: 0.5, ease: easePremium }}
                >
                  {mode.title}
                </motion.span>
              </AnimatePresence>
            </h3>
            <p className="mt-4 text-pretty text-muted">{mode.text}</p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button href={mode.href} icon="whatsapp" arrow external size="lg">
                Consultar por WhatsApp
              </Button>
              <a href={phone.href} className="text-sm text-ink">
                <span className="link-underline pb-0.5 tabular-nums">o llame al {phone.display}</span>
              </a>
            </div>

            <p className="mt-8 text-sm text-pretty text-muted">{extras}</p>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
