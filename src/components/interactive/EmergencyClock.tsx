import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';

const ZONE = 'America/Costa_Rica';
const C = 200;
const R = 168;
const SEGMENTS = Array.from({ length: 24 }, (_, h) => h);

/** Arc path for hour h on the 24-hour ring (00 at the top, clockwise). */
function segment(h: number) {
  const gap = 1.6;
  const a0 = ((h * 15 + gap / 2 - 90) * Math.PI) / 180;
  const a1 = (((h + 1) * 15 - gap / 2 - 90) * Math.PI) / 180;
  const p = (a: number) => `${(C + R * Math.cos(a)).toFixed(2)} ${(C + R * Math.sin(a)).toFixed(2)}`;
  return `M${p(a0)} A${R} ${R} 0 0 1 ${p(a1)}`;
}

function nowInCostaRica() {
  const parts = new Intl.DateTimeFormat('es-CR', {
    timeZone: ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { h: get('hour'), m: get('minute'), s: get('second') };
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A 24-hour ring with every hour lit — the "24/7" made literal — plus a hand
 * and a digital readout of the current time in Costa Rica. The time is only
 * known on the client, so the server renders the ring without a hand.
 */
export default function EmergencyClock() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') setTime(nowInCostaRica());
    };
    // First reading on the next frame, then once per second.
    const first = requestAnimationFrame(() => setTime(nowInCostaRica()));
    const id = window.setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(first);
      window.clearInterval(id);
    };
  }, []);

  const handAngle = time ? (time.h + time.m / 60) * 15 : 0;

  return (
    <figure className="relative mx-auto w-full max-w-[17rem] sm:max-w-[22rem] lg:max-w-[28rem]">
      <svg ref={ref} viewBox="0 0 400 400" className="w-full" role="img" aria-label="Reloj de 24 horas: todas las horas del día disponibles.">
        {/* Hour ring: every segment lit = available every hour */}
        {SEGMENTS.map((h) => {
          const current = time?.h === h;
          return (
            <motion.path
              key={h}
              d={segment(h)}
              fill="none"
              strokeWidth={current ? 26 : 20}
              className={current ? 'stroke-paper' : 'stroke-paper/80'}
              initial={{ opacity: 0.12 }}
              animate={inView ? { opacity: 1 } : undefined}
              transition={{ duration: 0.35, delay: 0.15 + h * 0.035 }}
            />
          );
        })}

        {/* Quarter labels */}
        {[0, 6, 12, 18].map((h) => {
          const a = ((h * 15 - 90) * Math.PI) / 180;
          const r = R - 34;
          return (
            <text
              key={h}
              x={C + r * Math.cos(a)}
              y={C + r * Math.sin(a) + 4}
              textAnchor="middle"
              className="fill-paper/80 font-mono"
              style={{ fontSize: 12, letterSpacing: '0.06em' }}
            >
              {pad(h)}
            </text>
          );
        })}

        {/* Minor hour ticks inside the ring */}
        {SEGMENTS.map((h) => (
          <line
            key={`t-${h}`}
            x1={C}
            x2={C}
            y1={C - R + 16}
            y2={C - R + (h % 6 === 0 ? 24 : 20)}
            className="stroke-paper/45"
            strokeWidth="1.2"
            transform={`rotate(${h * 15} ${C} ${C})`}
          />
        ))}

        {/* Hand: drawn outside the readout so it never crosses the digits */}
        {time && (
          <g style={{ transform: `rotate(${handAngle}deg)`, transformOrigin: `${C}px ${C}px` }} className="transition-transform duration-700 ease-premium">
            <line x1={C} x2={C} y1={C - 96} y2={C - R + 30} className="stroke-paper" strokeWidth="2" strokeLinecap="round" />
            <circle cx={C} cy={C - R + 30} r="4" className="fill-paper" />
          </g>
        )}
      </svg>

      {/* Digital readout */}
      <figcaption className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-[clamp(1.75rem,5vw,2.75rem)] leading-none tracking-[-0.02em] tabular-nums">
          {time ? `${pad(time.h)}:${pad(time.m)}` : '--:--'}
          <span className="text-paper/60 text-[0.45em]">{time ? `:${pad(time.s)}` : ''}</span>
        </span>
        <span className="mt-3 font-mono text-label text-paper/80 uppercase">Hora de Costa Rica</span>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper/10 px-3 py-1.5 font-mono text-label uppercase">
          <span className="relative grid size-2 place-items-center" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-paper motion-safe:animate-live-ping" />
            <span className="relative size-1.5 rounded-full bg-paper" />
          </span>
          Abierto ahora
        </span>
      </figcaption>
    </figure>
  );
}
