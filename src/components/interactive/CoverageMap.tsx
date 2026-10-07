import { useState } from 'react';
import { AnimatePresence, MotionConfig, m } from 'motion/react';
import type { CoverageTier } from '../../data/coverage';
import { MAP_HEIGHT, MAP_WIDTH, capitals, type ProvinceShape } from '../../data/costa-rica-map';
import Button from '../ui/Button';
import { withLazyMotion } from '../../utils/motion';

export interface CoverageProvince extends ProvinceShape {
  tier: CoverageTier;
  href: string;
}

interface CoverageMapProps {
  provinces: ReadonlyArray<CoverageProvince>;
  tiers: Record<CoverageTier, { label: string; detail: string }>;
  phone: { href: string; display: string };
}

const easePremium = [0.22, 1, 0.36, 1] as const;

const tierFill: Record<CoverageTier, string> = {
  principal: 'fill-cobalt',
  gam: 'fill-cobalt/55',
  nacional: 'fill-[#2a3346]',
};

const tierSwatch: Record<CoverageTier, string> = {
  principal: 'bg-cobalt',
  gam: 'bg-cobalt/55',
  nacional: 'bg-[#2a3346] ring-1 ring-paper/25 ring-inset',
};

/** Pins sit on the provincial capitals of the zones named on the site. */
const PIN_IDS = ['san-jose', 'heredia', 'alajuela'] as const;

/**
 * Coverage map of Costa Rica (real province shapes). A signal pulses out from
 * the Gran Área Metropolitana across the whole country; pressing a province
 * (on the map or in the picker) shows its coverage and a WhatsApp link that
 * names the province. Hover only highlights — it never changes the selection.
 */
function CoverageMap({ provinces, tiers, phone }: CoverageMapProps) {
  const [active, setActive] = useState(provinces[0].id);
  const shown = provinces.find((p) => p.id === active) ?? provinces[0];
  const [ox, oy] = capitals['san-jose'];

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-y-10 lg:grid-cols-12 lg:items-center lg:gap-x-10">
        {/* Map */}
        <figure className="relative min-w-0 lg:col-span-7">
          <figcaption className="flex items-center justify-between font-mono text-label text-paper/60 uppercase">
            <span>Fig. 08 — Cobertura</span>
            <span className="text-paper">{shown.name}</span>
          </figcaption>

          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="mt-4 w-full"
            role="img"
            aria-label="Mapa de Costa Rica con las siete provincias. Heredia, San José y Alajuela son zonas principales; Cartago, Gran Área Metropolitana; el resto, todo el territorio nacional."
          >
            <defs>
              <clipPath id="cr-clip">
                {provinces.map((p) => (
                  <path key={p.id} d={p.d} />
                ))}
              </clipPath>
            </defs>

            {provinces.map((p) => {
              const on = p.id === shown.id;
              return (
                <path
                  key={p.id}
                  d={p.d}
                  onClick={() => setActive(p.id)}
                  className={`cursor-pointer stroke-ink transition-[fill,opacity] duration-300 ease-premium ${tierFill[p.tier]} ${
                    on ? 'opacity-100' : shown.tier === p.tier ? 'opacity-90 hover:opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Signal from the GAM, sweeping the whole country */}
            <g clipPath="url(#cr-clip)" className="pointer-events-none">
              {[0, 1, 2].map((i) => (
                <m.circle
                  key={i}
                  cx={ox}
                  cy={oy}
                  r="40"
                  fill="none"
                  className="stroke-paper"
                  strokeWidth="1.5"
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: 9, opacity: [0, 0.55, 0] }}
                  transition={{ duration: 6, delay: i * 2, repeat: Infinity, ease: 'easeOut' }}
                />
              ))}
            </g>

            {/* Active outline on top */}
            <path d={shown.d} fill="none" className="pointer-events-none stroke-paper" strokeWidth="2.5" strokeLinejoin="round" />

            {PIN_IDS.map((id) => {
              const [x, y] = capitals[id];
              return (
                <g key={id} className="pointer-events-none">
                  <circle cx={x} cy={y} r="7" className="fill-paper/25" />
                  <circle cx={x} cy={y} r="3.5" className="fill-paper stroke-ink" strokeWidth="1.5" />
                </g>
              );
            })}

            <text
              x={shown.cx}
              y={shown.cy}
              textAnchor="middle"
              className="pointer-events-none fill-paper font-mono"
              style={{ fontSize: 13, letterSpacing: '0.12em', paintOrder: 'stroke', stroke: '#0a0f1a', strokeWidth: 4 }}
            >
              {shown.name.toUpperCase()}
            </text>
          </svg>

          {/* Legend */}
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-label text-paper/75 uppercase">
            {(Object.keys(tiers) as CoverageTier[]).map((tier) => (
              <li key={tier} className="flex items-center gap-2">
                <span className={`size-2.5 rounded-[3px] ${tierSwatch[tier]}`} aria-hidden="true" />
                {tiers[tier].label}
              </li>
            ))}
          </ul>
        </figure>

        {/* Province picker + detail */}
        <div className="min-w-0 lg:col-span-5">
          <div role="group" aria-label="Elija una provincia" className="flex flex-wrap gap-2">
            {provinces.map((p) => {
              const on = p.id === active;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(p.id)}
                  className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm tracking-[-0.01em] transition-colors duration-300 ease-premium ${
                    on ? 'bg-paper text-ink' : 'text-paper/80 ring-1 ring-paper/20 ring-inset hover:bg-paper/[0.07] hover:text-paper'
                  }`}
                >
                  <span className={`size-2 rounded-full ${tierSwatch[p.tier]}`} aria-hidden="true" />
                  {p.name}
                </button>
              );
            })}
          </div>

          <div className="mt-8 border-t border-paper/15 pt-6" aria-live="polite">
            <p className="font-mono text-label text-paper/60 uppercase">{tiers[shown.tier].label}</p>
            <h3 className="relative mt-3 overflow-hidden pb-[0.08em]">
              <AnimatePresence mode="popLayout" initial={false}>
                <m.span
                  key={shown.id}
                  className="block text-[clamp(2rem,3vw+0.75rem,3rem)] leading-[1] font-medium tracking-[-0.04em]"
                  initial={{ y: '105%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '-105%' }}
                  transition={{ duration: 0.45, ease: easePremium }}
                >
                  {shown.name}
                </m.span>
              </AnimatePresence>
            </h3>
            <p className="mt-3 text-pretty text-paper/75">{tiers[shown.tier].detail}</p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button href={shown.href} variant="inverse" icon="whatsapp" arrow external size="lg">
                {`Pedir cerrajero en ${shown.name}`}
              </Button>
              <a href={phone.href} className="text-sm text-paper">
                <span className="link-underline pb-0.5 tabular-nums">o llame al {phone.display}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

export default withLazyMotion(CoverageMap);
