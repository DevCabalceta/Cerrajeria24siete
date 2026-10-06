import { useEffect, useRef, useState } from 'react';
import {
  MotionConfig,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import type { Motor, MotorId } from '../../data/gates';

interface GateStageProps {
  motors: ReadonlyArray<Motor>;
}

/* ─────────────────────────────────────────────────────────────
   Elevation geometry (SVG user units)
   ───────────────────────────────────────────────────────────── */

const GROUND = 320;
const OPEN_L = 362; // opening between the posts
const OPEN_R = 898;
const GATE_TOP = 100;
const RAIL = 278; // bottom rail top
const SLIDE = 470;
const PINION = { x: 322, y: 303, r: 9 };
const LEAF = (OPEN_R - OPEN_L) / 2;

const VIEW_WIDE = '-140 0 1100 340';
const VIEW_TIGHT = '250 50 700 290';

function Bars({ from, to }: { from: number; to: number }) {
  const bars = [];
  for (let x = from + 22; x < to - 10; x += 32) bars.push(x);
  return (
    <>
      <rect x={from} y={GATE_TOP} width={to - from} height="10" rx="2" className="fill-paper/85" />
      <rect x={from} y={RAIL} width={to - from} height="10" rx="2" className="fill-paper/85" />
      <rect x={from} y={GATE_TOP} width="8" height={RAIL - GATE_TOP + 10} className="fill-paper/85" />
      <rect x={to - 8} y={GATE_TOP} width="8" height={RAIL - GATE_TOP + 10} className="fill-paper/85" />
      {bars.map((x) => (
        <line key={x} x1={x} x2={x} y1={GATE_TOP + 10} y2={RAIL} className="stroke-paper/70" strokeWidth="3" />
      ))}
      <line x1={from + 8} x2={to - 8} y1="190" y2="190" className="stroke-paper/40" strokeWidth="2" />
    </>
  );
}

function Gear({ rotate, teeth = 10, chain = false }: { rotate: MotionValue<number>; teeth?: number; chain?: boolean }) {
  return (
    <motion.g style={{ rotate }}>
      <circle cx={PINION.x} cy={PINION.y} r={PINION.r} className="fill-ink stroke-cobalt-bright" strokeWidth="2" />
      {Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        const r1 = PINION.r;
        const r2 = PINION.r + (chain ? 3 : 3.5);
        return (
          <line
            key={i}
            x1={PINION.x + r1 * Math.cos(a)}
            y1={PINION.y + r1 * Math.sin(a)}
            x2={PINION.x + r2 * Math.cos(a)}
            y2={PINION.y + r2 * Math.sin(a)}
            className="stroke-cobalt-bright"
            strokeWidth={chain ? 2 : 3}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={PINION.x} cy={PINION.y} r="2.5" className="fill-cobalt-bright" />
    </motion.g>
  );
}

function SlidingGate({ pos, chain }: { pos: MotionValue<number>; chain: boolean }) {
  const x = useTransform(pos, (p) => -SLIDE * p);
  const gearRotate = useTransform(x, (v) => (v / PINION.r) * (180 / Math.PI));
  return (
    <>
      <motion.g style={{ x }}>
        <Bars from={OPEN_L} to={OPEN_R} />
        {chain ? (
          <line x1={OPEN_L} x2={OPEN_R} y1="291" y2="291" className="stroke-cobalt-bright" strokeWidth="3" strokeDasharray="4 2" />
        ) : (
          Array.from({ length: Math.floor((OPEN_R - OPEN_L) / 8) }, (_, i) => (
            <rect key={i} x={OPEN_L + i * 8 + 1} y="288" width="4" height="6" className="fill-cobalt-bright" />
          ))
        )}
        {[OPEN_L + 40, OPEN_R - 40].map((cx) => (
          <circle key={cx} cx={cx} cy={GROUND - 6} r="6" className="fill-ink stroke-paper/70" strokeWidth="2" />
        ))}
      </motion.g>
      {/* Motor, in front of the gate */}
      <rect x="292" y="306" width="60" height="14" rx="3" className="fill-ink-soft stroke-paper/40" />
      <Gear rotate={gearRotate} chain={chain} teeth={chain ? 12 : 10} />
    </>
  );
}

function SwingGate({ pos }: { pos: MotionValue<number> }) {
  const scaleX = useTransform(pos, (p) => 1 - 0.86 * p);
  const leftArm = useTransform(scaleX, (s) => OPEN_L + LEAF * 0.55 * s);
  const rightArm = useTransform(scaleX, (s) => OPEN_R - LEAF * 0.55 * s);
  return (
    <>
      <motion.g style={{ scaleX, originX: 0 }}>
        <Bars from={OPEN_L} to={OPEN_L + LEAF - 2} />
      </motion.g>
      <motion.g style={{ scaleX, originX: 1 }}>
        <Bars from={OPEN_L + LEAF + 2} to={OPEN_R} />
      </motion.g>
      {/* Pistons: fixed cylinder on the post, rod reaching the leaf */}
      <rect x="296" y="232" width="56" height="10" rx="5" className="fill-ink-soft stroke-cobalt-bright" strokeWidth="1.5" />
      <motion.line x1="350" y1="237" x2={leftArm} y2="237" className="stroke-cobalt-bright" strokeWidth="3" strokeLinecap="round" />
      <rect x="908" y="232" width="56" height="10" rx="5" className="fill-ink-soft stroke-cobalt-bright" strokeWidth="1.5" />
      <motion.line x1="910" y1="237" x2={rightArm} y2="237" className="stroke-cobalt-bright" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────── */

type Phase = 'Cerrado' | 'Abriendo' | 'Abierto' | 'Cerrando';

/**
 * Electric gate as a blueprint. It opens on its own when it scrolls into
 * view; the remote opens and closes it, and the motor selector swaps the drive
 * (rack and pinion, chain, or pistons on a swing gate) with the real mechanism
 * moving in sync.
 */
export default function GateStage({ motors }: GateStageProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [motor, setMotor] = useState<MotorId>('cremallera');
  const [target, setTarget] = useState(0);
  const [phase, setPhase] = useState<Phase>('Cerrado');
  const [led, setLed] = useState(0);
  const [tight, setTight] = useState(false);
  const percentRef = useRef<HTMLSpanElement>(null);

  const pos = useSpring(0, { stiffness: 38, damping: 14, mass: 1.2 });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 47.99rem)');
    const update = () => setTight(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reduce) pos.jump(target);
    else pos.set(target);
  }, [target, pos, reduce]);

  // First sighting: the gate opens by itself.
  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setTarget(1), 350);
    return () => window.clearTimeout(t);
  }, [inView]);

  useMotionValueEvent(pos, 'change', (v) => {
    if (percentRef.current) percentRef.current.textContent = `${String(Math.round(v * 100)).padStart(3, '0')}%`;
    const moving = Math.abs(v - target) > 0.01;
    setPhase(moving ? (target > v ? 'Abriendo' : 'Cerrando') : target === 1 ? 'Abierto' : 'Cerrado');
  });

  const press = (value: 0 | 1) => {
    setTarget(value);
    setLed((n) => n + 1);
  };

  const chooseMotor = (id: MotorId) => {
    if (id === motor) return;
    setMotor(id);
    // Demonstrate the new drive: close instantly, then open again.
    pos.jump(0);
    setTarget(0);
    window.setTimeout(() => setTarget(1), 300);
  };

  const current = motors.find((m) => m.id === motor) ?? motors[0];

  return (
    <MotionConfig reducedMotion="user">
      <div ref={ref}>
        {/* Motor selector + readouts */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-label text-paper/60 uppercase">Tipo de motor</p>
            <div role="group" aria-label="Tipo de motor" className="mt-3 inline-flex rounded-full p-1 ring-1 ring-paper/15 ring-inset">
              {motors.map((m) => {
                const on = m.id === motor;
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => chooseMotor(m.id)}
                    className={`relative h-9 rounded-full px-4 text-[0.8125rem] tracking-[-0.01em] transition-colors duration-300 ${on ? 'text-ink' : 'text-paper/75 hover:text-paper'}`}
                  >
                    {on && (
                      <motion.span
                        layoutId="motor-pill"
                        className="absolute inset-0 rounded-full bg-paper"
                        transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="flex flex-col gap-1 font-mono text-label text-paper/60 uppercase sm:items-end" aria-live="polite">
            <span className="flex items-center gap-2 text-paper">
              <span
                className={`size-1.5 rounded-full ${phase === 'Abierto' ? 'bg-live' : phase === 'Cerrado' ? 'bg-signal' : 'bg-cobalt-bright'}`}
                aria-hidden="true"
              />
              {phase}
            </span>
            <span className="tabular-nums" aria-hidden="true">
              Apertura <span ref={percentRef}>000%</span>
            </span>
          </div>
            {/* Remote: the "controles" service, in miniature */}
            <div className="flex items-center gap-1.5 rounded-full bg-[#1b2232] p-1.5 ring-1 ring-paper/15">
              <motion.span
                key={led}
                aria-hidden="true"
                className="mx-1.5 size-1.5 rounded-full bg-cobalt-bright"
                initial={{ opacity: led ? 1 : 0.3 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 0.8 }}
              />
              <button
                type="button"
                onClick={() => press(1)}
                aria-label="Abrir portón"
                className="grid size-11 place-items-center rounded-full bg-paper/[0.08] text-paper transition-[background-color,scale] duration-200 hover:bg-paper/15 active:scale-90"
              >
                <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
                  <path d="M8 4 13 11H3Z" className="fill-current" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => press(0)}
                aria-label="Cerrar portón"
                className="grid size-11 place-items-center rounded-full bg-paper/[0.08] text-paper transition-[background-color,scale] duration-200 hover:bg-paper/15 active:scale-90"
              >
                <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
                  <path d="M8 12 3 5H13Z" className="fill-current" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stage */}
        <figure className="relative mt-6">
          <div className="relative aspect-[2.4] overflow-hidden rounded-[1.25rem] bg-[#0f1522] ring-1 ring-paper/10 md:aspect-[3.24]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(245_245_241/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(245_245_241/0.04)_1px,transparent_1px)] bg-[size:24px_24px]"
            />
            <svg
              viewBox={tight ? VIEW_TIGHT : VIEW_WIDE}
              preserveAspectRatio="xMidYMid meet"
              className="relative size-full"
              role="img"
              aria-label={`${current.gate} con motor de ${current.label.toLowerCase()}: ${phase.toLowerCase()}.`}
            >
              {/* Wall where a sliding gate parks */}
              <rect x="-120" y="150" width="450" height={GROUND - 150} className="fill-paper/[0.04] stroke-paper/15" />
              {Array.from({ length: 14 }, (_, i) => (
                <line key={i} x1={-120 + i * 34} y1={GROUND} x2={-120 + i * 34 + 30} y2="150" className="stroke-paper/[0.07]" />
              ))}
              {/* Access behind the gate */}
              <text x={(OPEN_L + OPEN_R) / 2} y="214" textAnchor="middle" className="fill-paper/25 font-mono" style={{ fontSize: 13, letterSpacing: '0.3em' }}>
                ACCESO
              </text>
              {/* Ground + track */}
              <line x1="-140" x2="960" y1={GROUND} y2={GROUND} className="stroke-paper/45" strokeWidth="2" />
              {motor !== 'pistones' && (
                <line x1="-120" x2={OPEN_R + 4} y1={GROUND - 1} y2={GROUND - 1} className="stroke-paper/25" strokeWidth="3" />
              )}

              {motor === 'pistones' ? <SwingGate pos={pos} /> : <SlidingGate pos={pos} chain={motor === 'cadena'} />}

              {/* Posts */}
              <rect x="334" y="70" width="28" height={GROUND - 70} rx="3" className="fill-[#1b2232] stroke-paper/45" strokeWidth="1.5" />
              <rect x={OPEN_R} y="70" width="28" height={GROUND - 70} rx="3" className="fill-[#1b2232] stroke-paper/45" strokeWidth="1.5" />
            </svg>

            <figcaption className="absolute top-3 left-4 font-mono text-label text-paper/60 uppercase sm:top-4 sm:left-5">
              Fig. 06<span className="hidden sm:inline"> — {current.gate}</span> · {current.label}
            </figcaption>
          </div>

        </figure>

        <p className="mt-5 max-w-[40rem] text-sm text-paper/70">{current.note}</p>
      </div>
    </MotionConfig>
  );
}
