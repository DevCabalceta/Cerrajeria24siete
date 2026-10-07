import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { AnimatePresence, MotionConfig, m, useReducedMotion, type Variants } from 'motion/react';
import type { NavItem } from '../../data/navigation';
import type { ContactLinks } from '../../utils/contact';
import Button from '../ui/Button';
import LiveStatus from '../ui/LiveStatus';
import Logo from '../ui/Logo';
import { ArrowUpRightIcon } from '../ui/icons';
import { withLazyMotion } from '../../utils/motion';

interface MobileMenuProps {
  items: ReadonlyArray<NavItem>;
  contact: ContactLinks;
}

interface Origin {
  x: number;
  y: number;
  r: number;
}

const PANEL_ID = 'mobile-menu';
const easePremium = [0.22, 1, 0.36, 1] as const;
const easeExpo = [0.76, 0, 0.24, 1] as const;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Fullscreen mobile menu.
 *  – The panel opens as a circular reveal centred on the toggle itself.
 *  – Links rise out of masks with a short stagger; hairlines draw in.
 *  – Closing reverses quickly, links leaving upward before the circle shrinks.
 * Accessibility: aria-expanded/controls, focus moved in and trapped, Escape,
 * background made inert, body scroll locked, focus restored on close.
 */
function MobileMenu({ items, contact }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<Origin>({ x: 0, y: 0, r: 0 });
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const pendingHash = useRef<string | null>(null);
  const reduceMotion = useReducedMotion();

  const openMenu = useCallback(() => {
    const rect = toggleRef.current?.getBoundingClientRect();
    if (rect) {
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      setOrigin({ x, y, r: Math.ceil(r) });
    }
    setOpen(true);
  }, []);

  const closeMenu = useCallback(() => setOpen(false), []);

  // Side effects that exist only while the menu is open.
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const toggle = toggleRef.current;
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;

    const inertTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-menu-inert]'));
    inertTargets.forEach((el) => (el.inert = true));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current || !toggleRef.current) return;

      const focusables = [toggleRef.current, ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // The menu only exists below the lg breakpoint.
    const desktop = window.matchMedia('(min-width: 64rem)');
    const onBreakpoint = () => desktop.matches && setOpen(false);

    document.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onBreakpoint);
    const raf = requestAnimationFrame(() => firstLinkRef.current?.focus({ preventScroll: true }));

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onBreakpoint);
      root.style.overflow = '';
      root.style.paddingRight = '';
      inertTargets.forEach((el) => (el.inert = false));

      const hash = pendingHash.current;
      pendingHash.current = null;
      const target = hash ? document.querySelector<HTMLElement>(hash) : null;

      if (target) {
        // Hand focus to the destination so keyboard and screen-reader users land there too.
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', hash);
      } else {
        toggle?.focus({ preventScroll: true });
      }
    };
  }, [open, reduceMotion]);

  const onNavigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    event.preventDefault();
    pendingHash.current = href;
    setOpen(false);
  };

  const at = `${origin.x}px ${origin.y}px`;
  const panelVariants: Variants = reduceMotion
    ? {
        closed: { opacity: 0 },
        open: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        closed: { clipPath: `circle(0px at ${at})` },
        open: {
          clipPath: `circle(${origin.r}px at ${at})`,
          transition: { duration: 0.75, ease: easeExpo },
        },
        exit: {
          clipPath: `circle(0px at ${at})`,
          transition: { duration: 0.55, ease: easeExpo, delay: 0.12 },
        },
      };

  const listVariants: Variants = {
    closed: {},
    open: { transition: { staggerChildren: 0.055, delayChildren: 0.2 } },
    exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  };

  const linkVariants: Variants = {
    closed: { y: '105%' },
    open: { y: '0%', transition: { duration: 0.8, ease: easePremium } },
    exit: { y: '-105%', transition: { duration: 0.35, ease: easeExpo } },
  };

  const lineVariants: Variants = {
    closed: { scaleX: 0 },
    open: { scaleX: 1, transition: { duration: 0.9, ease: easePremium } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const fadeUp: Variants = {
    closed: { opacity: 0, y: 12 },
    open: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easePremium, delay: 0.45 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  return (
    <MotionConfig reducedMotion="user">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={open ? closeMenu : openMenu}
        data-open={open}
        className={`group/toggle relative z-50 inline-flex h-11 items-center gap-2 rounded-full transition-colors duration-500 ease-premium sm:pl-4 ${
          open ? 'text-paper' : 'text-ink'
        }`}
      >
        {/* "Menú" / "Cerrar" label roll (tablet and up). */}
        <span aria-hidden="true" className="relative hidden h-5 overflow-hidden text-sm leading-5 sm:block">
          <span className="block transition-transform duration-500 ease-premium group-data-[open=true]/toggle:-translate-y-full">
            Menú
          </span>
          <span className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-premium group-data-[open=true]/toggle:translate-y-0">
            Cerrar
          </span>
        </span>

        <span
          aria-hidden="true"
          className={`relative grid size-11 place-items-center rounded-full ring-1 transition-[box-shadow,background-color] duration-500 ease-premium ring-inset ${
            open ? 'ring-paper/20' : 'ring-ink/15 group-hover/toggle:bg-ink/[0.04]'
          }`}
        >
          <m.span
            className="absolute h-[1.5px] w-[18px] rounded-full bg-current"
            initial={false}
            animate={open ? { y: 0, rotate: 45 } : { y: -3.5, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          />
          {/* Outer span rotates around the centre; inner span shortens from the right edge. */}
          <m.span
            className="absolute flex h-[1.5px] w-[18px] justify-end"
            initial={false}
            animate={open ? { y: 0, rotate: -45 } : { y: 3.5, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <span
              className={`h-full rounded-full bg-current transition-[width] duration-500 ease-premium ${
                open ? 'w-full' : 'w-2/3 group-hover/toggle:w-full'
              }`}
            />
          </m.span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            key="mobile-menu"
            ref={panelRef}
            id={PANEL_ID}
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className="fixed inset-0 z-40 flex h-dvh flex-col overflow-y-auto overscroll-contain bg-ink text-paper"
          >
            <div className="container-x flex h-16 shrink-0 items-center">
              <a
                href="#inicio"
                onClick={(event) => onNavigate(event, '#inicio')}
                className="group -m-2 rounded-xl p-2"
                aria-label="Cerrajería24siete, ir al inicio"
              >
                <Logo tone="paper" />
              </a>
            </div>

            <nav aria-label="Menú móvil" className="container-x flex flex-1 flex-col pt-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
              <m.div variants={fadeUp} className="flex items-center justify-between">
                <span className="font-mono text-label text-paper/45 uppercase">Menú</span>
                <LiveStatus label={contact.availability} tone="paper" />
              </m.div>

              <m.ul variants={listVariants} className="group/list mt-5">
                {items.map((item, index) => (
                  <li key={item.href} className="relative">
                    <m.span
                      aria-hidden="true"
                      variants={lineVariants}
                      className="absolute inset-x-0 top-0 h-px origin-left bg-paper/12"
                    />
                    <div className="overflow-hidden">
                      <m.a
                        ref={index === 0 ? firstLinkRef : undefined}
                        href={item.href}
                        onClick={(event) => onNavigate(event, item.href)}
                        variants={linkVariants}
                        className="group/link flex items-center gap-4 py-2.5 text-menu [@media(max-height:44rem)]:py-1.5 font-medium transition-opacity duration-300 ease-premium group-hover/list:opacity-40 hover:opacity-100! focus-visible:outline-offset-[-2px] active:opacity-60"
                      >
                        <span className="w-6 shrink-0 font-mono text-label text-paper/40 tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="transition-transform duration-500 ease-premium group-hover/link:translate-x-1.5">
                          {item.label}
                        </span>
                        <ArrowUpRightIcon className="ml-auto size-5 shrink-0 -translate-x-2 translate-y-2 text-paper/60 opacity-0 transition-[opacity,translate] duration-500 ease-premium group-hover/link:translate-0 group-hover/link:opacity-100" />
                      </m.a>
                    </div>
                  </li>
                ))}
              </m.ul>

              <m.div variants={fadeUp} className="mt-auto pt-10 [@media(max-height:44rem)]:pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <Button href={contact.tel} variant="inverse" size="lg" icon="phone">
                    Llamar
                  </Button>
                  <Button
                    href={contact.whatsapp}
                    variant="outline"
                    size="lg"
                    external
                    icon="whatsapp"
                  >
                    WhatsApp
                  </Button>
                </div>

                <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 text-sm [@media(max-height:44rem)]:mt-6">
                  <div className="[@media(max-height:44rem)]:hidden">
                    <dt className="font-mono text-label text-paper/45 uppercase">Teléfono</dt>
                    <dd className="mt-1.5">
                      <a href={contact.tel} className="link-underline pb-0.5">
                        {contact.phoneDisplay}
                      </a>
                    </dd>
                  </div>
                  <div className="[@media(max-height:44rem)]:hidden">
                    <dt className="font-mono text-label text-paper/45 uppercase">Horario</dt>
                    <dd className="mt-1.5 text-paper/75">{contact.hours}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-mono text-label text-paper/45 uppercase">Correo</dt>
                    <dd className="mt-1.5">
                      <a href={contact.mail} className="link-underline pb-0.5 break-all">
                        {contact.email}
                      </a>
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-mono text-label text-paper/45 uppercase">Cobertura</dt>
                    <dd className="mt-1.5 text-pretty text-paper/75">{contact.coverage}</dd>
                  </div>
                </dl>
              </m.div>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export default withLazyMotion(MobileMenu);
