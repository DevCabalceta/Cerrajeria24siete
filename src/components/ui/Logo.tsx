interface LogoProps {
  tone?: 'ink' | 'paper';
  className?: string;
}

/**
 * Wordmark + mark: a lock cylinder whose keyway turns a quarter on hover —
 * the gesture of a key unlocking. Hover is driven by a parent `.group`.
 * Static markup only (no hooks): safe to render from Astro or inside islands.
 */
export default function Logo({ tone = 'ink', className = '' }: LogoProps) {
  const isInk = tone === 'ink';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="9" className={isInk ? 'fill-ink' : 'fill-paper'} />
        <g className="origin-center transition-transform duration-700 ease-spring [transform-box:fill-box] group-hover:-rotate-90">
          <circle
            cx="16"
            cy="16"
            r="9.25"
            fill="none"
            strokeWidth="1.25"
            className={isInk ? 'stroke-paper/25' : 'stroke-ink/25'}
          />
          <path
            d="M16 11.1a2.8 2.8 0 0 1 1.45 5.2l.75 4.2h-4.4l.75-4.2A2.8 2.8 0 0 1 16 11.1Z"
            className={isInk ? 'fill-paper' : 'fill-ink'}
          />
        </g>
      </svg>
      <span
        className={`text-[0.9375rem] leading-none font-medium tracking-[-0.03em] whitespace-nowrap ${
          isInk ? 'text-ink' : 'text-paper'
        }`}
      >
        Cerrajería<span className={isInk ? 'text-muted' : 'text-paper/55'}>24siete</span>
      </span>
    </span>
  );
}
