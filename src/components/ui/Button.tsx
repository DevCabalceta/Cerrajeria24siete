import { ArrowUpRightIcon, MailIcon, PhoneIcon, WhatsAppIcon } from './icons';

type Variant = 'primary' | 'inverse' | 'quiet' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'hero';

/** Icons are referenced by name so the prop stays serializable from .astro files. */
const icons = { phone: PhoneIcon, whatsapp: WhatsAppIcon, mail: MailIcon } as const;
export type ButtonIcon = keyof typeof icons;

interface ButtonProps {
  href: string;
  children: string;
  variant?: Variant;
  size?: Size;
  /** Leading icon; gets a small spring nudge on hover. */
  icon?: ButtonIcon;
  /** Trailing arrow that swaps diagonally on hover. */
  arrow?: boolean;
  external?: boolean;
  className?: string;
  'aria-label'?: string;
}

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-soft',
  inverse: 'bg-paper text-ink hover:bg-white',
  quiet: 'bg-ink/[0.05] text-ink hover:bg-ink/[0.09]',
  outline: 'text-current ring-1 ring-current/20 ring-inset hover:ring-current/45 hover:bg-current/[0.04]',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 gap-2 px-3.5 text-[0.8125rem]',
  md: 'h-11 gap-2.5 px-5 text-sm',
  lg: 'h-14 gap-3 px-6 text-[0.9375rem]',
  /** lg height with tighter gutters on small phones, so two CTAs fit side by side. */
  hero: 'h-14 gap-2.5 px-4 text-[0.9375rem] sm:gap-3 sm:px-6',
};

/**
 * Link-as-button. Every micro-interaction is CSS (zero JS), so it can be
 * rendered statically from Astro or reused inside islands:
 *   – label rolls up to an identical copy
 *   – leading icon nudges with a spring curve
 *   – trailing arrow exits top-right while a twin enters from bottom-left
 *   – press compresses slightly
 */
export default function Button({
  href,
  children,
  variant = 'primary',
  size = 'md',
  icon,
  arrow = false,
  external = false,
  className = '',
  ...rest
}: ButtonProps) {
  const Icon = icon ? icons[icon] : null;

  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      aria-label={rest['aria-label']}
      className={`group/btn relative inline-flex shrink-0 items-center justify-center rounded-full font-medium tracking-[-0.01em] whitespace-nowrap select-none transition-[background-color,box-shadow,scale] duration-300 ease-premium active:scale-[0.97] ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && (
        <Icon className="size-[1.1em] shrink-0 transition-transform duration-500 ease-spring group-hover/btn:-rotate-12 group-hover/btn:scale-110" />
      )}

      <span className="relative block h-[1.25em] overflow-hidden leading-[1.25]">
        <span className="block transition-transform duration-500 ease-premium group-hover/btn:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-premium group-hover/btn:translate-y-0"
        >
          {children}
        </span>
      </span>

      {arrow && (
        <span aria-hidden="true" className="relative -mr-1 block size-[0.9em] overflow-hidden">
          <ArrowUpRightIcon className="absolute inset-0 size-full transition-transform duration-500 ease-premium group-hover/btn:translate-x-full group-hover/btn:-translate-y-full" />
          <ArrowUpRightIcon className="absolute inset-0 size-full -translate-x-full translate-y-full transition-transform duration-500 ease-premium group-hover/btn:translate-0" />
        </span>
      )}
    </a>
  );
}
