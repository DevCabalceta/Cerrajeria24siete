/**
 * "¿Por qué elegirnos?" — the five points listed on the current site, condensed.
 * Company-level claims (líder, garantía, mejores precios) live in
 * business.claims and are shown in the introduction instead.
 */
export interface Reason {
  title: string;
  text: string;
}

export const reasons: ReadonlyArray<Reason> = [
  { title: 'Personal certificado', text: 'Cerrajeros capacitados, de alta calidad y certificados.' },
  { title: 'Soporte 24/7', text: 'Soporte técnico las 24 horas, los 7 días de la semana.' },
  { title: 'Urbano y rural', text: 'Estamos en Costa Rica y trabajamos en perímetro urbano y rural.' },
  { title: 'Informe del servicio', text: 'Le entregamos un informe del servicio realizado.' },
  {
    title: 'Altos estándares',
    text: 'Los más altos estándares de calidad y servicio, atentos a las nuevas tendencias mundiales.',
  },
];
