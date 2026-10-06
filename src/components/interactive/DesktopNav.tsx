import { useEffect, useState } from 'react';
import { LayoutGroup, MotionConfig, motion } from 'motion/react';
import type { NavItem } from '../../data/navigation';

interface DesktopNavProps {
  items: ReadonlyArray<NavItem>;
}

const pillSpring = { type: 'spring', stiffness: 520, damping: 40, mass: 0.7 } as const;

/**
 * Desktop primary navigation.
 *  – A single soft pill follows the pointer (or keyboard focus) between links
 *    via a shared layout animation.
 *  – A small cobalt marker tracks the section currently in view (scroll spy).
 * Before hydration the server-rendered links work as plain anchors.
 */
export default function DesktopNav({ items }: DesktopNavProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(`#${entry.target.id}`, entry.isIntersecting);
        // Topmost section crossing the reading line wins.
        const current = items.find((item) => visible.get(item.href));
        setActive(current ? current.href : null);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="desktop-nav">
        <ul className="flex items-center" onMouseLeave={() => setHovered(null)}>
          {items.map((item) => {
            const isActive = active === item.href;
            return (
              <li key={item.href} className="relative">
                {hovered === item.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-ink/[0.055]"
                    transition={pillSpring}
                    aria-hidden="true"
                  />
                )}
                <a
                  href={item.href}
                  aria-current={isActive ? 'location' : undefined}
                  onMouseEnter={() => setHovered(item.href)}
                  onFocus={() => setHovered(item.href)}
                  onBlur={() => setHovered(null)}
                  className={`relative flex h-9 items-center rounded-full px-3 text-sm xl:px-3.5 tracking-[-0.01em] transition-colors duration-300 ease-premium focus-visible:outline-offset-0 ${
                    isActive || hovered === item.href ? 'text-ink' : 'text-ink/60'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-1/2 left-1.5 size-1 -translate-y-1/2 rounded-full bg-cobalt transition-[opacity,scale] duration-500 ease-spring ${
                      isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                  />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>
    </MotionConfig>
  );
}
