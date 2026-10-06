/**
 * Services as listed on https://cerrajeria24siete.com/ (reviewed 2026-10-05).
 * Grouped for the redesign; wording condensed from the original copy.
 */

export type ServiceCategory = 'general' | 'automotriz' | 'residencial' | 'cajas-fuertes' | 'portones';

export interface CategoryMeta {
  id: ServiceCategory;
  label: string;
  /** Compact label for chips on small screens. */
  short: string;
  /** One-line scope, derived from the services listed under it. */
  scope: string;
}

/** Display order of the specialities (also the order on the services dial). */
export const serviceCategories: ReadonlyArray<CategoryMeta> = [
  { id: 'general', label: 'Cerrajería general', short: 'General', scope: 'Cerraduras, llaves, llavines y candados.' },
  { id: 'residencial', label: 'Residencial y comercial', short: 'Residencial', scope: 'Casas, oficinas y locales.' },
  { id: 'automotriz', label: 'Automotriz', short: 'Automotriz', scope: 'Apertura de vehículos, llaves con chip y controles.' },
  { id: 'cajas-fuertes', label: 'Cajas fuertes', short: 'Cajas fuertes', scope: 'Digitales y mecánicas.' },
  { id: 'portones', label: 'Portones eléctricos', short: 'Portones', scope: 'Motores, controles y mantenimiento.' },
];

export interface Service {
  title: string;
  category: ServiceCategory;
  /** Paraphrase of the description on the current site. */
  summary: string;
}

export const services: ReadonlyArray<Service> = [
  {
    title: 'Cerrajería en general',
    category: 'general',
    summary: 'Servicio integral: mantenimiento y reparación de cerraduras hasta instalación de sistemas de seguridad.',
  },
  {
    title: 'Apertura de vehículos',
    category: 'automotriz',
    summary: 'Apertura de todo tipo de autos, a domicilio, 24/7.',
  },
  {
    title: 'Copias y programación de llaves con chip',
    category: 'automotriz',
    summary: 'Copia de mandos de autos nuevos o reparación de mandos, para cualquier marca y modelo.',
  },
  {
    title: 'Venta de controles y carcasas',
    category: 'automotriz',
    summary: 'Carcasas, forros y controles para todo tipo de control de vehículos.',
  },
  {
    title: 'Apertura de cajas fuertes',
    category: 'cajas-fuertes',
    summary: 'Cajas fuertes digitales y mecánicas: apertura sin dañar y reparación.',
  },
  {
    title: 'Apertura de casas',
    category: 'residencial',
    summary: 'Apertura de viviendas.',
  },
  {
    title: 'Apertura de oficinas y locales',
    category: 'residencial',
    summary: 'Apertura cuando se queda sin llaves de su oficina o local.',
  },
  {
    title: 'Apertura de candados',
    category: 'general',
    summary: 'Técnicos cerrajeros las 24 horas del día.',
  },
  {
    title: 'Cambio de combinación de cerraduras',
    category: 'residencial',
    summary: 'Cambio de combinación de sus cerraduras.',
  },
  {
    title: 'Amaestramiento de cerraduras y candados',
    category: 'residencial',
    summary: 'Menos llaves y control de accesos, con llave individual y maestra.',
  },
  {
    title: 'Extracción de llaves quebradas',
    category: 'general',
    summary: 'Extracción y confección de la llave sin desarmar el llavín, a domicilio.',
  },
  {
    title: 'Copias y confección de llaves',
    category: 'general',
    summary: 'Duplicado y confección de todo tipo de llaves, con o sin muestra.',
  },
  {
    title: 'Reparación, venta e instalación de cerraduras, llaves y candados',
    category: 'general',
    summary: 'Reparación de cerraduras, instalación de llavines para vehículos, llavines de ignición, motos y candados.',
  },
  {
    title: 'Servicio de portones eléctricos',
    category: 'portones',
    summary: 'Restauración y reparación de portones.',
  },
  {
    title: 'Mantenimiento y reparación de portones y motores eléctricos',
    category: 'portones',
    summary: 'Mantenimiento preventivo para hogares y empresas.',
  },
  {
    title: 'Venta e instalación de motores',
    category: 'portones',
    summary: 'Motores de cremallera, cadena y pistones.',
  },
  {
    title: 'Venta y programación de controles para portones',
    category: 'portones',
    summary: 'Controles remotos para portones de corredera: instalación y programación.',
  },
];
