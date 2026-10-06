/**
 * Single source of truth for business information.
 *
 * Every value here was taken from https://cerrajeria24siete.com/ (homepage,
 * reviewed 2026-10-05). Claims are the business's own statements on that site;
 * anything that could not be verified there is intentionally left out.
 */

export const business = {
  name: 'Cerrajería24siete',
  /** Shown on the current site header. */
  tagline: 'Su cerrajería de confianza',
  url: 'https://cerrajeria24siete.com',
  country: 'Costa Rica',
  countryCode: 'CR',

  phone: {
    /** E.164, used for tel: links and structured data. */
    e164: '+50683557575',
    display: '+506 8355 7575',
    short: '8355 7575',
  },

  whatsapp: {
    /** Digits only, as required by wa.me. */
    number: '50683557575',
    defaultMessage: 'Hola, necesito un servicio de cerrajería.',
  },

  email: 'servicioalcliente@cerrajeria24siete.com',

  /** "24/7 todo el año" · "las 24 Horas los 365 días". */
  availability: {
    label: 'Disponible 24/7',
    long: '24 horas, los 365 días',
  },

  /** "Cubrimos las siguientes zonas". */
  coverage: {
    areas: ['Heredia', 'San José', 'Alajuela'],
    summary: 'Gran Área Metropolitana y todo el territorio nacional',
  },

  /** "Contamos con más de 35 años de experiencia a su servicio." */
  experience: 'Más de 35 años de experiencia',
  experienceShort: 'Más de 35 años',

  /**
   * Statements from the current site ("Quiénes somos" / intro copy) that
   * cannot be verified independently; the owner confirmed them as accurate
   * on 2026-10-05.
   */
  claims: [
    'Empresa líder en su profesión',
    'Cerrajeros calificados y certificados',
    'Garantía en mercadería y materiales',
    'Siempre con los mejores precios',
  ],

  /**
   * No verified social profiles were found on the current site (only the
   * theme's generic share buttons). Add entries here once confirmed.
   */
  socials: [] as ReadonlyArray<{ label: string; href: string }>,
} as const;

export type Business = typeof business;
