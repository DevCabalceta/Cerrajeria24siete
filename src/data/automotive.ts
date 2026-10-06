/**
 * Automotive offer, each mode condensed from services listed on the current
 * site: "Apertura de vehiculos", "Copias y programación de llaves con chip",
 * "Venta de controles, carcasas" and the vehicle/ignition part of
 * "Reparación, venta e instalación de todo tipo de cerraduras".
 */

export type AutoModeId = 'abrir' | 'chip' | 'carcasa' | 'ignicion';

export interface AutoMode {
  id: AutoModeId;
  /** Label printed on the key fob button. */
  button: string;
  title: string;
  text: string;
  tags: ReadonlyArray<string>;
  /** Service name used in the pre-written WhatsApp message. */
  service: string;
}

export const autoModes: ReadonlyArray<AutoMode> = [
  {
    id: 'abrir',
    button: 'Abrir',
    title: 'Apertura de vehículos',
    text: 'Abrimos todo tipo de autos cuando las llaves quedaron adentro o se perdieron. Vamos hasta donde está, a cualquier hora.',
    tags: ['Todo tipo de autos', '24/7', 'A domicilio'],
    service: 'Apertura de vehículos',
  },
  {
    id: 'chip',
    button: 'Chip',
    title: 'Llaves con chip y mandos',
    text: 'Copias y programación de llaves con chip y mandos para cualquier marca y modelo: copia de mandos nuevos o reparación del suyo.',
    tags: ['Cualquier marca y modelo', 'Copia de mandos', 'Reparación'],
    service: 'Copias y programación de llaves con chip',
  },
  {
    id: 'carcasa',
    button: 'Carcasa',
    title: 'Controles, carcasas y forros',
    text: 'Venta de carcasas, forros y controles para todo tipo de control de vehículo, para renovar o proteger el suyo.',
    tags: ['Carcasas', 'Forros', 'Controles'],
    service: 'Venta de controles y carcasas',
  },
  {
    id: 'ignicion',
    button: 'Ignición',
    title: 'Llavines e ignición',
    text: 'Instalamos llavines para vehículos y reparamos llavines de ignición, también de motos.',
    tags: ['Llavines de vehículo', 'Ignición', 'Motos'],
    service: 'Reparación de llavín de ignición',
  },
];
