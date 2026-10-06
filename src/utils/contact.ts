import { business } from '../data/business';

export const telHref = `tel:${business.phone.e164}`;

export const mailHref = `mailto:${business.email}`;

export function whatsappHref(message: string = business.whatsapp.defaultMessage): string {
  return `https://wa.me/${business.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

/** Serializable contact payload for React islands. */
export const contactLinks = {
  tel: telHref,
  mail: mailHref,
  whatsapp: whatsappHref(),
  phoneDisplay: business.phone.display,
  email: business.email,
  availability: business.availability.label,
  hours: business.availability.long,
  coverage: `${business.coverage.areas.join(' · ')} — ${business.coverage.summary}`,
} as const;

export type ContactLinks = typeof contactLinks;
