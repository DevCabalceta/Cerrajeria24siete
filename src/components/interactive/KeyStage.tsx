import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useReducedMotion } from 'motion/react';
import LockStatus, { type LockStatusHandle } from './LockStatus';

/* ─────────────────────────────────────────────────────────────
   Keyring geometry (SVG user units)
   ───────────────────────────────────────────────────────────── */

const HOOK = { x: 200, y: 40 }; // ring pivot
const RING_R = 46;
const G = 2600; // "gravity", units/s²
const RING_LEN = 70; // effective pendulum length of the ring
const RING_DAMP = 2.4;
const ITEM_DAMP = 1.9;
const FAN = 0.55; // how much items fan out from their attach angle
const MAX_SPIN = 6; // rad/s clamp
const SWING_LIMIT = 1.0; // rad from rest before a soft stop kicks in
const PUSH = 0.45; // how much of the pointer's speed transfers to a key
const GRAB_K = 140;

type ItemId = 'remote' | 'safe' | 'car' | 'tag' | 'house';

interface ItemSpec {
  id: ItemId;
  /** Attach angle on the ring, degrees from straight down (positive = right). */
  phi: number;
  /** Pivot → centre of mass (sets the swing frequency). */
  com: number;
  /** Pivot → tip, used for hit testing. */
  reach: number;
  /** Half width for hit testing. */
  half: number;
}

// Back-to-front order.
const ITEMS: ReadonlyArray<ItemSpec> = [
  { id: 'remote', phi: -62, com: 50, reach: 92, half: 22 },
  { id: 'safe', phi: 60, com: 86, reach: 168, half: 18 },
  { id: 'car', phi: -31, com: 70, reach: 154, half: 24 },
  { id: 'tag', phi: 31, com: 64, reach: 114, half: 22 },
  { id: 'house', phi: 0, com: 82, reach: 200, half: 26 },
];

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

const attach = ITEMS.map((item) => {
  const p = rad(item.phi);
  return { x: RING_R * Math.sin(p), y: RING_R + RING_R * Math.cos(p) };
});
const restAngle = ITEMS.map((item) => -FAN * rad(item.phi));
const attachDist = attach.map((a) => Math.hypot(a.x, a.y));
const HOUSE = ITEMS.findIndex((item) => item.id === 'house');
const REMOTE = ITEMS.findIndex((item) => item.id === 'remote');

const itemTransform = (i: number, theta: number, alpha: number) =>
  `translate(${attach[i].x.toFixed(2)} ${attach[i].y.toFixed(2)}) rotate(${deg(theta - alpha).toFixed(3)})`;
const ringTransform = (alpha: number) => `translate(${HOOK.x} ${HOOK.y}) rotate(${deg(alpha).toFixed(3)})`;

const formatAngle = (r: number) => {
  const d = deg(r);
  return `${d < 0 ? '−' : '+'}${Math.abs(d).toFixed(1).padStart(4, '0')}°`;
};

/* ─────────────────────────────────────────────────────────────
   Shapes — each drawn hanging down from its pivot at (0,0)
   ───────────────────────────────────────────────────────────── */

interface Paint {
  steel: string;
  steelDark: string;
  fob: string;
}

function Shape({ id, paint, ledRef }: { id: ItemId; paint: Paint; ledRef: RefObject<SVGCircleElement | null> }) {
  const outline = 'rgb(10 15 26 / 0.28)';
  const loop = <circle cx="0" cy="6" r="6" fill="none" stroke={paint.steel} strokeWidth="3" />;

  const shapes: Record<ItemId, ReactNode> = {
    house: (
      <>
        <path
          fillRule="evenodd"
          fill={paint.steel}
          stroke={outline}
          strokeWidth="1"
          d="M-30 22a30 30 0 1 0 60 0a30 30 0 1 0 -60 0Z M-6 3a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z"
        />
        <circle cx="0" cy="22" r="21" fill="none" stroke={outline} strokeOpacity="0.5" />
        <rect x="-12" y="49" width="26" height="9" rx="2" fill={paint.steel} stroke={outline} />
        <path
          fill={paint.steel}
          stroke={outline}
          strokeWidth="1"
          strokeLinejoin="round"
          d="M-7 58H9V100L15 106L9 114L15 122L9 130L14 138L9 146L15 154L9 164L12 172L9 180V190L1 198H-7Z"
        />
        <path d="M-2 64V188" stroke={outline} strokeWidth="1.5" strokeOpacity="0.55" />
      </>
    ),
    car: (
      <>
        {loop}
        <rect x="-22" y="12" width="44" height="62" rx="16" fill={paint.fob} />
        <rect x="-8" y="26" width="16" height="12" rx="6" fill="#222a38" stroke="rgb(255 255 255 / 0.1)" />
        <rect x="-8" y="44" width="16" height="12" rx="6" fill="#222a38" stroke="rgb(255 255 255 / 0.1)" />
        <circle cx="0" cy="32" r="1.6" fill="rgb(255 255 255 / 0.55)" />
        <circle cx="0" cy="50" r="1.6" fill="rgb(255 255 255 / 0.55)" />
        <path d="M-6 74H6V146Q6 154 0 154Q-6 154 -6 146Z" fill={paint.steel} stroke={outline} />
        <path d="M0 82C4 92 -4 102 0 112C4 122 -4 132 0 142" fill="none" stroke={outline} strokeWidth="1.6" />
      </>
    ),
    remote: (
      <>
        {loop}
        <rect x="-19" y="12" width="38" height="78" rx="13" fill="#222a38" />
        <circle ref={ledRef} cx="0" cy="22" r="2.2" fill="#4b5563" className="transition-[fill] duration-300" />
        <circle cx="0" cy="42" r="8" fill={paint.fob} stroke="rgb(255 255 255 / 0.08)" />
        <circle cx="0" cy="66" r="8" fill={paint.fob} stroke="rgb(255 255 255 / 0.08)" />
      </>
    ),
    tag: (
      <>
        {loop}
        <rect x="-21" y="14" width="42" height="98" rx="10" className="fill-cobalt" />
        <circle cx="0" cy="26" r="5" className="fill-paper" />
        <text
          x="0"
          y="72"
          textAnchor="middle"
          className="fill-paper font-sans"
          style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.04em' }}
        >
          24/7
        </text>
        <text
          x="0"
          y="96"
          textAnchor="middle"
          className="fill-paper/70 font-mono"
          style={{ fontSize: 7, letterSpacing: '0.12em' }}
        >
          C24
        </text>
      </>
    ),
    safe: (
      <>
        <circle cx="0" cy="11" r="14" fill="none" stroke={paint.steelDark} strokeWidth="7" />
        <circle cx="0" cy="11" r="17.5" fill="none" stroke={outline} strokeOpacity="0.5" />
        <rect x="-7" y="28" width="14" height="8" rx="2" fill={paint.steelDark} stroke={outline} />
        <rect x="-4" y="36" width="8" height="128" rx="3" fill={paint.steelDark} stroke={outline} />
        <path d="M4 136H24V146H18V152H24V162H4Z" fill={paint.steelDark} stroke={outline} strokeLinejoin="round" />
      </>
    ),
  };

  return <>{shapes[id]}</>;
}

/* ─────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────── */

/**
 * Hero centrepiece: a keyring hanging from above, simulated as coupled
 * pendulums. Pointer contact pushes keys (or grab and fling them); the loop
 * only runs while something moves. Each piece maps to a verified service:
 * house key, car key, gate remote, safe key and a 24/7 tag.
 * Touching the house key "opens" the lock readout.
 */
export default function KeyStage() {
  const uid = useId().replace(/:/g, '');
  const paint: Paint = { steel: `url(#steel-${uid})`, steelDark: `url(#steel-dark-${uid})`, fob: `url(#fob-${uid})` };

  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const ringRef = useRef<SVGGElement>(null);
  const itemRefs = useRef<Array<SVGGElement | null>>([]);
  const ledRef = useRef<SVGCircleElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const [interacted, setInteracted] = useState(false);
  const lockRef = useRef<LockStatusHandle>(null);

  // Mutable physics state (kept out of React to avoid re-renders per frame).
  const sim = useRef({
    alpha: 0,
    alphaV: 0,
    theta: [...restAngle],
    omega: ITEMS.map(() => 0),
    grabbed: -1,
    grabTarget: 0,
    pointer: { x: 0, y: 0, t: 0, has: false },
    running: false,
    raf: 0,
    last: 0,
    calm: 0,
    ledTimer: 0,
    lastUnlock: 0,
  });

  const render = useCallback(() => {
    const s = sim.current;
    ringRef.current?.setAttribute('transform', ringTransform(s.alpha));
    itemRefs.current.forEach((el, i) => el?.setAttribute('transform', itemTransform(i, s.theta[i], s.alpha)));
    if (readoutRef.current) readoutRef.current.textContent = formatAngle(s.theta[HOUSE] - restAngle[HOUSE]);
  }, []);

  /** Integrates one frame; returns false once everything has settled. */
  const advance = useCallback(
    (now: number): boolean => {
      const s = sim.current;
      const dt = Math.min(Math.max((now - s.last) / 1000, 0), 1 / 30);
      s.last = now;

      const sub = 2;
      const h = dt / sub;
      for (let k = 0; k < sub; k++) {
        let alphaAcc = -(G / RING_LEN) * Math.sin(s.alpha) - RING_DAMP * s.alphaV;

        const thetaAcc = ITEMS.map((item, i) => {
          const rest = restAngle[i] + s.alpha * 0.5;
          const dev = s.theta[i] - rest;
          let acc = -(G / item.com) * Math.sin(dev) - ITEM_DAMP * s.omega[i];
          // Soft stop: keys on a ring rarely swing past ~60°.
          if (Math.abs(dev) > SWING_LIMIT) acc -= Math.sign(dev) * (Math.abs(dev) - SWING_LIMIT) * 420 + s.omega[i] * 4;
          if (s.grabbed === i) {
            let diff = s.grabTarget - s.theta[i];
            diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            acc += GRAB_K * diff - 9 * s.omega[i];
            alphaAcc -= GRAB_K * diff * 0.04;
          }
          return acc;
        });

        s.alphaV += alphaAcc * h;
        s.alpha += s.alphaV * h;
        ITEMS.forEach((_, i) => {
          // Ring acceleration drags the attach point; items lag behind it.
          const coupled = thetaAcc[i] - alphaAcc * (attachDist[i] / ITEMS[i].com) * 0.45;
          s.omega[i] = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, s.omega[i] + coupled * h));
          s.theta[i] += s.omega[i] * h;
        });
      }

      render();

      const energy =
        Math.abs(s.alphaV) + Math.abs(s.alpha) + s.omega.reduce((a, w, i) => a + Math.abs(w) + Math.abs(s.theta[i] - restAngle[i] - s.alpha * 0.5), 0);
      s.calm = energy < 0.004 ? s.calm + 1 : 0;

      return !(s.calm > 20 && s.grabbed < 0);
    },
    [render],
  );

  const start = useCallback(() => {
    const s = sim.current;
    if (s.running) return;
    s.running = true;
    s.calm = 0;
    s.last = performance.now();
    function frame(now: number) {
      if (!advance(now)) {
        s.running = false;
        return;
      }
      s.raf = requestAnimationFrame(frame);
    }
    s.raf = requestAnimationFrame(frame);
  }, [advance]);

  /** Pointer position in SVG user units. */
  const toLocal = (event: PointerEvent | React.PointerEvent) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
  };

  /** World-space pivot of item i. */
  const pivotOf = (i: number) => {
    const { alpha } = sim.current;
    const a = attach[i];
    return {
      x: HOOK.x + a.x * Math.cos(alpha) - a.y * Math.sin(alpha),
      y: HOOK.y + a.x * Math.sin(alpha) + a.y * Math.cos(alpha),
    };
  };

  /** Index of the front-most item under the point, or -1. */
  const hitTest = (p: { x: number; y: number }, slack = 0) => {
    for (let i = ITEMS.length - 1; i >= 0; i--) {
      const pivot = pivotOf(i);
      const th = sim.current.theta[i];
      const ux = -Math.sin(th);
      const uy = Math.cos(th);
      const rx = p.x - pivot.x;
      const ry = p.y - pivot.y;
      const along = Math.max(0, Math.min(ITEMS[i].reach, rx * ux + ry * uy));
      const dist = Math.hypot(rx - ux * along, ry - uy * along);
      if (dist < ITEMS[i].half + slack) return i;
    }
    return -1;
  };

  const flashLed = () => {
    const s = sim.current;
    ledRef.current?.setAttribute('fill', '#17a34a');
    window.clearTimeout(s.ledTimer);
    s.ledTimer = window.setTimeout(() => ledRef.current?.setAttribute('fill', '#4b5563'), 700);
  };

  const signalUnlock = () => {
    const s = sim.current;
    const now = performance.now();
    if (now - s.lastUnlock < 2500) return;
    s.lastUnlock = now;
    lockRef.current?.replay();
  };

  const touched = (i: number) => {
    if (!interacted) setInteracted(true);
    if (i === REMOTE) flashLed();
    if (i === HOUSE) signalUnlock();
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (reduceMotion) return;
    const s = sim.current;
    const p = toLocal(event);
    if (!p) return;

    const t = event.timeStamp;
    const prev = s.pointer;
    s.pointer = { x: p.x, y: p.y, t, has: true };

    if (s.grabbed >= 0) {
      const pivot = pivotOf(s.grabbed);
      s.grabTarget = Math.atan2(-(p.x - pivot.x), p.y - pivot.y);
      start();
      return;
    }

    const hovering = hitTest(p, 4);
    event.currentTarget.style.cursor = hovering >= 0 ? 'grab' : '';
    if (!prev.has) return;

    const dtp = Math.max((t - prev.t) / 1000, 1 / 120);
    const vx = (p.x - prev.x) / dtp;
    const vy = (p.y - prev.y) / dtp;
    if (Math.hypot(vx, vy) < 30) return;

    let kicked = false;
    ITEMS.forEach((_, i) => {
      if (hitTest(p, 6) !== i) return;
      const pivot = pivotOf(i);
      const rx = p.x - pivot.x;
      const ry = p.y - pivot.y;
      const target = (PUSH * (rx * vy - ry * vx)) / Math.max(rx * rx + ry * ry, 900);
      s.omega[i] += (target - s.omega[i]) * 0.22;
      s.alphaV += target * 0.03;
      kicked = true;
      touched(i);
    });

    // Brushing the ring itself sways the whole bunch.
    const cx = HOOK.x - RING_R * Math.sin(s.alpha);
    const cy = HOOK.y + RING_R * Math.cos(s.alpha);
    if (Math.abs(Math.hypot(p.x - cx, p.y - cy) - RING_R) < 8) {
      const rx = p.x - HOOK.x;
      const ry = p.y - HOOK.y;
      s.alphaV += ((PUSH * (rx * vy - ry * vx)) / Math.max(rx * rx + ry * ry, 900)) * 0.2;
      kicked = true;
    }

    if (kicked) start();
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (reduceMotion) return;
    const p = toLocal(event);
    if (!p) return;
    const i = hitTest(p, 8);
    if (i < 0) return;
    const s = sim.current;
    s.grabbed = i;
    const pivot = pivotOf(i);
    s.grabTarget = Math.atan2(-(p.x - pivot.x), p.y - pivot.y);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.cursor = 'grabbing';
    // A tap (no drag) on touch screens should still feel like flicking the key.
    if (event.pointerType !== 'mouse') s.omega[i] += (p.x < pivot.x ? 1 : -1) * 1.8;
    touched(i);
    start();
  };

  const release = (event: React.PointerEvent<SVGSVGElement>) => {
    const s = sim.current;
    if (s.grabbed < 0) return;
    s.grabbed = -1;
    event.currentTarget.style.cursor = '';
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    start();
  };

  const onPointerLeave = () => {
    sim.current.pointer.has = false;
  };

  // Entrance: a short jingle, as if the keys were just hung. It waits for the
  // page to finish loading so the simulation never competes with first paint.
  useEffect(() => {
    if (reduceMotion) return;
    const s = sim.current;
    let timer = 0;
    const jingle = () => {
      timer = window.setTimeout(() => {
        s.alphaV = 0.9;
        s.omega = ITEMS.map((_, i) => (i % 2 ? -1 : 1) * (0.7 + i * 0.15));
        start();
      }, 350);
    };
    if (document.readyState === 'complete') jingle();
    else window.addEventListener('load', jingle, { once: true });
    return () => {
      window.removeEventListener('load', jingle);
      window.clearTimeout(timer);
    };
  }, [reduceMotion, start]);

  // Stop simulating when offscreen.
  useEffect(() => {
    const svg = svgRef.current;
    const s = sim.current;
    if (!svg) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && s.running) {
        cancelAnimationFrame(s.raf);
        s.running = false;
      }
    });
    observer.observe(svg);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(s.raf);
    };
  }, []);

  return (
    <div className="relative size-full">
      {/* Technical-drawing backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(10_15_26/0.13)_1px,transparent_1.3px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_42%,black,transparent)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between font-mono text-label text-muted uppercase"
      >
        <span className="flex flex-col gap-1.5">
          <span>Fig. 01 — Llavero</span>
          <span
            className={`flex items-center gap-2 transition-opacity duration-700 ease-premium ${
              interacted || reduceMotion ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <span className="inline-block motion-safe:animate-[nudge_2.4s_var(--ease-premium)_infinite]">↔</span>
            <span className="hidden [@media(hover:hover)]:inline">Pase el cursor</span>
            <span className="[@media(hover:hover)]:hidden">Deslice o toque</span>
          </span>
        </span>
        <span className="tabular-nums">
          θ <span ref={readoutRef}>+00.0°</span>
        </span>
      </div>

      <svg
        ref={svgRef}
        role="img"
        aria-label="Llavero ilustrado con una llave de casa, una llave de carro, un control de portón, una llave de caja fuerte y una etiqueta 24/7."
        viewBox="40 0 320 400"
        preserveAspectRatio="xMidYMin meet"
        className="relative size-full touch-pan-y overflow-visible select-none lg:drop-shadow-[0_22px_22px_rgb(10_15_26/0.16)]"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={onPointerLeave}
      >
        <defs>
          <linearGradient id={`steel-${uid}`} x1="0" y1="0" x2="1" y2="0.15">
            <stop offset="0" stopColor="#f3f4f4" />
            <stop offset="0.45" stopColor="#cdd1d5" />
            <stop offset="1" stopColor="#9aa1a8" />
          </linearGradient>
          <linearGradient id={`steel-dark-${uid}`} x1="0" y1="0" x2="1" y2="0.15">
            <stop offset="0" stopColor="#d9dcdf" />
            <stop offset="0.5" stopColor="#a8aeb4" />
            <stop offset="1" stopColor="#7c848c" />
          </linearGradient>
          <linearGradient id={`fob-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a3242" />
            <stop offset="1" stopColor="#0a0f1a" />
          </linearGradient>
          <linearGradient id={`thread-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a0f1a" stopOpacity="0" />
            <stop offset="1" stopColor="#0a0f1a" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Plumb line: the gravity reference of the drawing */}
        <line x1={HOOK.x} y1="56" x2={HOOK.x} y2="400" stroke="rgb(10 15 26 / 0.12)" strokeDasharray="2 5" />

        {/* Thread fading in from above, and the hook */}
        <line x1={HOOK.x} y1="-70" x2={HOOK.x} y2="14" stroke={`url(#thread-${uid})`} strokeWidth="1.25" />
        <rect x={HOOK.x - 12} y="10" width="24" height="7" rx="2.5" className="fill-ink" />
        <path
          d={`M${HOOK.x} 17V31a6 6 0 1 1 -6 6`}
          fill="none"
          className="stroke-ink"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <g ref={ringRef} transform={ringTransform(0)}>
          {ITEMS.map((item, i) => (
            <g
              key={item.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              transform={itemTransform(i, restAngle[i], 0)}
            >
              <Shape id={item.id} paint={paint} ledRef={ledRef} />
            </g>
          ))}
          {/* Split ring, drawn last so it reads as passing through every eye */}
          <circle cx="0" cy={RING_R} r={RING_R} fill="none" stroke={paint.steelDark} strokeWidth="4.5" />
          <circle cx="0" cy={RING_R} r={RING_R} fill="none" stroke="rgb(255 255 255 / 0.55)" strokeWidth="1" strokeDasharray="40 250" />
        </g>
      </svg>

      <div className="absolute right-0 bottom-0 hidden sm:block">
        <LockStatus ref={lockRef} />
      </div>
    </div>
  );
}
