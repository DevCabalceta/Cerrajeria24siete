import type { GlyphName } from '../components/ui/glyphs';

/**
 * Emergency situations, each framed from a service listed on the current site
 * (see services.ts). `message` is appended to the WhatsApp greeting.
 */
export interface Emergency {
  id: string;
  label: string;
  glyph: GlyphName;
  message: string;
  /** The verified service this situation maps to. */
  service: string;
}

export const emergencies: ReadonlyArray<Emergency> = [
  {
    id: 'casa',
    label: 'Me quedé afuera de casa',
    glyph: 'house',
    message: 'me quedé afuera de mi casa',
    service: 'Apertura de casas',
  },
  {
    id: 'carro',
    label: 'Llaves dentro del carro',
    glyph: 'car',
    message: 'dejé las llaves dentro del carro',
    service: 'Apertura de vehículos',
  },
  {
    id: 'quebrada',
    label: 'Llave quebrada en el llavín',
    glyph: 'brokenKey',
    message: 'se me quebró la llave dentro del llavín',
    service: 'Extracción de llaves quebradas',
  },
  {
    id: 'oficina',
    label: 'Oficina o local cerrado',
    glyph: 'office',
    message: 'no puedo abrir mi oficina o local',
    service: 'Apertura de oficinas y locales',
  },
  {
    id: 'caja',
    label: 'Caja fuerte bloqueada',
    glyph: 'safe',
    message: 'no puedo abrir mi caja fuerte',
    service: 'Apertura de cajas fuertes',
  },
  {
    id: 'porton',
    label: 'El portón eléctrico no abre',
    glyph: 'gate',
    message: 'mi portón eléctrico no abre',
    service: 'Servicio de portones eléctricos',
  },
];
