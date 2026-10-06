import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { ArrowUpRightIcon } from '../ui/icons';

/* ─────────────────────────────────────────────────────────────
   Pin-tumbler geometry (SVG user units, viewBox -28 0 572 300)
   ───────────────────────────────────────────────────────────── */

const SHEAR = 150; // shear line: top edge of the plug
const PIN_BASE = 196; // where key pins rest on the key blade
const BLADE_BOTTOM = 224;
const DRIVER = 28;
const SPRING_TOP = 50;
const SPRING_H0 = 80; // natural path height of the spring drawing

const PIN_X = [150, 205, 260, 315, 370];
const KEY_PIN = [30, 40, 24, 36, 28];
/** Lift that puts each key pin's top exactly on the shear line. */
const TARGET = KEY_PIN.map((len) => PIN_BASE - SHEAR - len);

/** Key bitting height at key-local x (teeth cut to match TARGET). */
function profile(x: number): number {
  if (x < 58 || x > 432) return 0;
  let h = 0;
  PIN_X.forEach((c, j) => {
    h = Math.max(h, TARGET[j] - Math.max(0, Math.abs(x - c) - 3));
  });
  return h;
}

const KEY_PATH = (() => {
  let d = 'M58 ' + (PIN_BASE - profile(58));
  for (let x = 60; x <= 430; x += 2) d += ` L${x} ${(PIN_BASE - profile(x)).toFixed(1)}`;
  d += ` L444 206 L444 216 L436 ${BLADE_BOTTOM} L58 ${BLADE_BOTTOM} Z`;
  return d;
})();

const SPRING_PATH = (() => {
  let d = 'M0 0';
  for (let y = 4, s = -1; y < SPRING_H0; y += 8, s *= -1) d += ` L${s * 7} ${y}`;
  return `${d} L0 ${SPRING_H0}`;
})();

const KEY_START = -400; // fully outside the cylinder

/** Maps raw scroll progress to the story's phases. */
const PHASE = {
  textStart: 0.06,
  textEnd: 0.62,
  keyStart: 0.04,
  keyEnd: 0.5,
  turnStart: 0.56,
  turnEnd: 0.72,
  outroStart: 0.62,
  outroEnd: 0.76,
  pointsStart: 0.66,
  pointStep: 0.045,
};

/* ─────────────────────────────────────────────────────────────
   Pieces
   ───────────────────────────────────────────────────────────── */

function Pin({ index, keyX }: { index: number; keyX: MotionValue<number> }) {
  const lift = useTransform(keyX, (o) => profile(PIN_X[index] - o));
  const y = useTransform(lift, (l) => -l);
  const springScale = useTransform(lift, (l) => (PIN_BASE - l - KEY_PIN[index] - DRIVER - SPRING_TOP) / SPRING_H0);
  const keyTop = PIN_BASE - KEY_PIN[index];

  return (
    <g>
      <g transform={`translate(${PIN_X[index]} ${SPRING_TOP})`}>
        <motion.path
          d={SPRING_PATH}
          fill="none"
          className="stroke-ink/45"
          strokeWidth="1.4"
          strokeLinejoin="round"
          style={{ scaleY: springScale, originY: 0 }}
        />
      </g>
      <motion.g style={{ y }}>
        {/* Driver pin */}
        <rect x={PIN_X[index] - 9} y={keyTop - DRIVER} width="18" height={DRIVER} rx="3" className="fill-ink-soft" />
        {/* Key pin, with a pointed tip where it meets the key */}
        <path
          d={`M${PIN_X[index] - 9} ${keyTop + 3}q0 -3 3 -3h12q3 0 3 3V${PIN_BASE - 6}L${PIN_X[index]} ${PIN_BASE}L${PIN_X[index] - 9} ${PIN_BASE - 6}Z`}
          fill="url(#pt-steel)"
          className="stroke-ink/25"
        />
      </motion.g>
    </g>
  );
}

function RevealWord({
  word,
  progress,
  range,
  accent,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
}) {
  // Unrevealed tone keeps ≥3:1 contrast (large text) so the copy stays readable.
  const color = useTransform(progress, range, ['#7a7f88', accent ? '#1d4ed8' : '#0a0f1a']);
  return <motion.span style={{ color }}>{word} </motion.span>;
}

function RevealPoint({
  index,
  text,
  progress,
}: {
  index: number;
  text: string;
  progress: MotionValue<number>;
}) {
  const start = PHASE.pointsStart + index * PHASE.pointStep;
  const range = [start, start + 0.06];
  // A miniature pin rises to its own shear line as the point "aligns".
  const pinY = useTransform(progress, range, [5, 0]);
  const shear = useTransform(progress, range, [0.15, 1]);
  const color = useTransform(progress, range, ['#5c6371', '#0a0f1a']);

  return (
    <li className="flex items-start gap-3 border-t border-line py-3 sm:items-center [@media(max-height:44rem)]:py-2">
      <svg viewBox="0 0 12 18" className="mt-0.5 h-[18px] w-3 shrink-0 sm:mt-0" aria-hidden="true">
        <rect x="3" y="1" width="6" height="16" rx="1.5" className="fill-ink/[0.07]" />
        <motion.rect x="4" y="7" width="4" height="9" rx="1" fill="url(#pt-steel)" className="stroke-ink/30" strokeWidth="0.5" style={{ y: pinY }} />
        <motion.line x1="0" x2="12" y1="7" y2="7" className="stroke-cobalt" strokeWidth="1" style={{ opacity: shear }} />
      </svg>
      <span className="mt-px font-mono text-label text-muted sm:mt-0">P{index + 1}</span>
      <motion.span style={{ color }} className="text-[0.8125rem] leading-snug tracking-[-0.01em] sm:text-[0.9375rem]">
        {text}
      </motion.span>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────
   Story
   ───────────────────────────────────────────────────────────── */

interface PinTumblerStoryProps {
  /** id for the heading, so the wrapping <section> can reference it. */
  titleId: string;
  eyebrow: string;
  statement: string;
  /** Words (exact match, punctuation included) rendered in the accent colour. */
  accentWords?: ReadonlyArray<string>;
  /** Credentials that "align" one by one as the lock opens. */
  points: ReadonlyArray<string>;
  cta: { label: string; href: string };
}

/**
 * Scroll-told introduction. While the section is pinned, a key slides into a
 * pin-tumbler cylinder: every pin is lifted to the shear line, the plug turns
 * and the lock opens — in step with the statement being "unlocked" word by word,
 * then each credential aligns like a pin.
 * Without JS or with reduced motion, everything renders in its final state.
 */
export default function PinTumblerStory({ titleId, eyebrow, statement, accentWords = [], points, cta }: PinTumblerStoryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });

  // Server render / no-JS / reduced motion = final (unlocked) state.
  const live = useMotionValue(0);
  useEffect(() => {
    live.set(reduceMotion ? 0 : 1);
  }, [reduceMotion, live]);
  const progress = useTransform([scrollYProgress, live], ([p, l]: number[]) => (l ? p : 1));

  const keyX = useTransform(progress, [PHASE.keyStart, PHASE.keyEnd], [KEY_START, 0], { clamp: true });
  const turn = useTransform(progress, [PHASE.turnStart, PHASE.turnEnd], [0, 90], { clamp: true });
  const plugFill = useTransform(progress, [PHASE.turnStart, PHASE.turnEnd], ['#ffffff', '#dfe6fb']);
  const shearOpacity = useTransform(progress, [PHASE.turnStart, PHASE.turnEnd], [0.55, 1]);
  const outroOpacity = useTransform(progress, [PHASE.outroStart, PHASE.outroEnd], [0, 1]);
  const outroY = useTransform(progress, [PHASE.outroStart, PHASE.outroEnd], [16, 0]);

  const [aligned, setAligned] = useState(PIN_X.length);
  const [open, setOpen] = useState(true);

  useMotionValueEvent(keyX, 'change', (o) => {
    const count = PIN_X.reduce((n, x, i) => n + (Math.abs(profile(x - o) - TARGET[i]) < 1.2 ? 1 : 0), 0);
    setAligned(count);
  });
  useMotionValueEvent(turn, 'change', (deg) => setOpen(deg >= 80));

  const words = statement.split(' ');
  const span = (PHASE.textEnd - PHASE.textStart) / words.length;

  return (
    <div ref={trackRef} className="relative h-[240svh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh items-center pt-16 motion-reduce:static motion-reduce:h-auto motion-reduce:py-24 lg:pt-20">
        <div className="container-x grid w-full items-center gap-y-8 lg:grid-cols-12 lg:gap-x-10 [@media(max-height:44rem)]:gap-y-4">
          {/* Diagram */}
          <figure className="lg:col-span-6 lg:order-1">
            <div className="flex items-center justify-between font-mono text-label text-muted uppercase">
              <span>Fig. 02 — Cilindro de pines</span>
              <span className="tabular-nums">
                Pines {aligned}/{PIN_X.length}
              </span>
            </div>

            <svg
              viewBox="-28 0 572 300"
              className="mt-4 w-full [@media(max-height:44rem)]:mt-2 [@media(max-height:44rem)]:max-h-36"
              role="img"
              aria-label="Corte de un cilindro de pines: la llave correcta levanta cada pin hasta la línea de corte y el cilindro gira."
            >
              <defs>
                <linearGradient id="pt-steel" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#f3f4f4" />
                  <stop offset="0.5" stopColor="#c9cdd1" />
                  <stop offset="1" stopColor="#9aa1a8" />
                </linearGradient>
              </defs>

              {/* Housing */}
              <rect x="60" y="36" width="400" height="214" rx="20" fill="#ecebe6" className="stroke-ink/10" />
              {PIN_X.map((x) => (
                <rect key={`ch-${x}`} x={x - 11} y="46" width="22" height={SHEAR - 46} rx="3" fill="#dfded8" />
              ))}

              {/* Plug */}
              <motion.rect x="72" y={SHEAR} width="376" height="88" rx="12" className="stroke-ink/15" style={{ fill: plugFill }} />
              {PIN_X.map((x) => (
                <rect key={`pc-${x}`} x={x - 11} y={SHEAR} width="22" height={PIN_BASE - SHEAR} fill="#f1f1ee" />
              ))}
              <rect x="72" y="192" width="376" height="36" fill="#e6e6e1" />

              {/* Pins and springs */}
              {PIN_X.map((_, i) => (
                <Pin key={`pin-${i}`} index={i} keyX={keyX} />
              ))}

              {/* Shear line */}
              <motion.line
                x1="60"
                x2="464"
                y1={SHEAR}
                y2={SHEAR}
                className="stroke-cobalt"
                strokeWidth="1.25"
                strokeDasharray="5 4"
                style={{ opacity: shearOpacity }}
              />
              <text x="468" y={SHEAR - 5} className="fill-cobalt font-mono" style={{ fontSize: 8, letterSpacing: '0.08em' }}>
                <tspan x="468">LÍNEA</tspan>
                <tspan x="468" dy="10">DE CORTE</tspan>
              </text>

              {/* Key */}
              <motion.g style={{ x: keyX }}>
                <path
                  fillRule="evenodd"
                  d="M-16 210a30 30 0 1 0 60 0a30 30 0 1 0 -60 0Z M5 210a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z"
                  fill="url(#pt-steel)"
                  className="stroke-ink/25"
                />
                <rect x="40" y="198" width="20" height="24" rx="3" fill="url(#pt-steel)" className="stroke-ink/25" />
                <path d={KEY_PATH} fill="url(#pt-steel)" className="stroke-ink/30" strokeLinejoin="round" />
                <path d="M70 213H424" className="stroke-ink/15" strokeWidth="1.5" />
              </motion.g>

              {/* Housing face the key slides behind */}
              <rect x="52" y="186" width="14" height="46" rx="3" className="fill-ink" />
            </svg>

            <figcaption className="mt-4 flex flex-wrap [@media(max-height:44rem)]:hidden items-center gap-x-6 gap-y-3 font-mono text-label text-muted uppercase">
              <span className="flex items-center gap-3">
                <svg viewBox="0 0 40 40" className="size-9" aria-hidden="true">
                  <circle cx="20" cy="20" r="18" fill="#ecebe6" className="stroke-ink/15" />
                  <motion.g style={{ rotate: turn, originX: '20px', originY: '20px' }}>
                    <circle cx="20" cy="20" r="11" className="fill-white stroke-ink/20" />
                    <rect x="18.5" y="11" width="3" height="18" rx="1.5" className="fill-ink" />
                  </motion.g>
                </svg>
                <span>
                  Estado ·{' '}
                  <span className={open ? 'text-live' : 'text-signal'}>{open ? 'Abierto' : 'Cerrado'}</span>
                </span>
              </span>
              <span className="hidden items-center gap-2 sm:flex">
                <span className="h-2.5 w-2 rounded-[2px] bg-[linear-gradient(90deg,#f3f4f4,#9aa1a8)] ring-1 ring-ink/20" aria-hidden="true" />
                Pin de llave
              </span>
              <span className="hidden items-center gap-2 sm:flex">
                <span className="h-2.5 w-2 rounded-[2px] bg-ink-soft" aria-hidden="true" />
                Pin conductor
              </span>
            </figcaption>
          </figure>

          {/* Copy */}
          <div className="lg:col-span-6 lg:order-2 lg:pl-6">
            <p className="flex items-center gap-3 font-mono text-label text-muted uppercase">
              <span className="text-ink">(01)</span>
              {eyebrow}
            </p>
            <h2
              id={titleId}
              className="mt-5 text-[clamp(1.625rem,min(8vw,3.6svh),2.25rem)] leading-[1.06] sm:text-[clamp(2rem,min(5.5vw,4.4svh),2.75rem)] lg:text-[clamp(2rem,3vw+0.75rem,3.25rem)] [@media(max-height:44rem)]:mt-3 font-medium tracking-[-0.035em] text-balance"
            >
              {words.map((word, i) => (
                <RevealWord
                  key={`${word}-${i}`}
                  word={word}
                  progress={progress}
                  range={[PHASE.textStart + i * span, PHASE.textStart + (i + 1.6) * span]}
                  accent={accentWords.includes(word)}
                />
              ))}
            </h2>

            <ul className="mt-6 grid max-w-[38rem] grid-cols-2 [@media(max-height:44rem)]:mt-4 gap-x-5 lg:mt-10 lg:gap-x-8">
              {points.map((point, i) => (
                <RevealPoint key={point} index={i} text={point} progress={progress} />
              ))}
            </ul>

            <motion.div style={{ opacity: outroOpacity, y: outroY }} className="mt-5 lg:mt-8">
              <a href={cta.href} className="group/cta inline-flex items-center gap-2 text-sm font-medium text-ink">
                <span className="link-underline pb-0.5">{cta.label}</span>
                <ArrowUpRightIcon className="size-3.5 transition-transform duration-500 ease-spring group-hover/cta:rotate-45" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
