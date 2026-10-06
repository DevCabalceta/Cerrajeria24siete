export interface NavItem {
  label: string;
  /** In-page anchor; must match a section id in index.astro. */
  href: `#${string}`;
}

/** Primary navigation (desktop bar + mobile menu), in page order. */
export const primaryNav: ReadonlyArray<NavItem> = [
  { label: 'Empresa', href: '#empresa' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Emergencias', href: '#emergencias' },
  { label: 'Cobertura', href: '#cobertura' },
  { label: 'Galería', href: '#galeria' },
  { label: 'Preguntas', href: '#preguntas' },
];

/** The mobile menu also links to the final contact block. */
export const mobileNav: ReadonlyArray<NavItem> = [...primaryNav, { label: 'Contacto', href: '#contacto' }];
