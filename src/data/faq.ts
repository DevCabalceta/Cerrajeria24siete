import { business } from './business';

/**
 * Frequently asked questions. Every answer restates facts from the current
 * site (or claims the owner confirmed, see business.claims). No prices,
 * response times or guarantees beyond what the site states.
 */
export interface Faq {
  question: string;
  answer: string;
}

const areas = business.coverage.areas.join(', ');

export const faqs: ReadonlyArray<Faq> = [
  {
    question: '¿Atienden emergencias a cualquier hora?',
    answer: `Sí. Trabajamos ${business.availability.long}, también de noche, fines de semana y feriados.`,
  },
  {
    question: '¿Cuál es la forma más rápida de contactarlos?',
    answer: `Llame al ${business.phone.display} o escríbanos por WhatsApp al mismo número. Si escribe, cuéntenos qué pasó y dónde está: así le ayudamos desde el primer mensaje.`,
  },
  {
    question: '¿Van hasta donde estoy?',
    answer: `Sí, el servicio es a domicilio. Cubrimos ${areas}, la ${business.coverage.summary}, en perímetro urbano y rural.`,
  },
  {
    question: 'Me quedé afuera de mi casa, oficina o local. ¿Qué hacen?',
    answer: 'Hacemos apertura de casas, oficinas y locales. Si además perdió las llaves, podemos cambiar la combinación de la cerradura para que la llave anterior deje de abrir.',
  },
  {
    question: '¿Abren carros de cualquier marca?',
    answer: 'Abrimos todo tipo de autos. También hacemos copias y programación de llaves con chip y mandos para cualquier marca y modelo.',
  },
  {
    question: 'Se me quebró la llave dentro del llavín, ¿tiene solución?',
    answer: 'Sí. Extraemos la llave quebrada y confeccionamos una nueva sin necesidad de desarmar el llavín, a domicilio.',
  },
  {
    question: '¿Pueden abrir una caja fuerte sin dañarla?',
    answer: 'Abrimos cajas fuertes digitales y mecánicas sin dañarlas, y también las reparamos.',
  },
  {
    question: '¿Reparan portones eléctricos?',
    answer: 'Sí: restauración, reparación y mantenimiento preventivo de portones y motores eléctricos, venta e instalación de motores de cremallera, cadena y pistones, y venta y programación de controles.',
  },
  {
    question: '¿Cuánto cuesta el servicio?',
    answer: 'Depende del trabajo. Cotice sin ningún compromiso por teléfono o WhatsApp; siempre buscamos darle el mejor precio.',
  },
  {
    question: '¿Ofrecen garantía y comprobante?',
    answer: 'Sí. Damos garantía en mercadería y materiales, y le entregamos un informe del servicio realizado.',
  },
];
