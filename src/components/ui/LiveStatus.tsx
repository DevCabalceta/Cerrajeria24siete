interface LiveStatusProps {
  label: string;
  tone?: 'ink' | 'paper';
  className?: string;
}

/** "● Disponible 24/7" — a calm live indicator. The ping ring is CSS only. */
export default function LiveStatus({ label, tone = 'ink', className = '' }: LiveStatusProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 font-mono whitespace-nowrap text-label uppercase ${
        tone === 'ink' ? 'text-muted' : 'text-paper/60'
      } ${className}`}
    >
      <span className="relative grid size-2 place-items-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-live motion-safe:animate-live-ping" />
        <span className="relative size-1.5 rounded-full bg-live" />
      </span>
      {label}
    </span>
  );
}
