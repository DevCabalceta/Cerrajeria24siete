/**
 * Residential & commercial modes, condensed from services on the current site:
 * "Apertura de casas", "Apertura de oficinas y locales", "Copias y confección
 * de todo tipo de llaves", "Amaestramiento de cerraduras, candados" (llave
 * individual y maestra) and "Cambio de combinación de cerraduras".
 */

export type DoorId = 'entrada' | 'oficina' | 'habitacion' | 'bodega';
export type ResidentialModeId = 'apertura' | 'individual' | 'maestra' | 'cambio';

export interface ResidentialMode {
  id: ResidentialModeId;
  label: string;
  hint: string;
  title: string;
  text: string;
  /** Doors this mode opens on the plan (the "cambio" mode runs its own sequence). */
  opens: ReadonlyArray<DoorId>;
  service: string;
}

export const residentialModes: ReadonlyArray<ResidentialMode> = [
  {
    id: 'apertura',
    label: 'Sin llave',
    hint: 'Apertura',
    title: 'Apertura de casas, oficinas y locales',
    text: '¿Se quedó sin llaves? Abrimos casas, oficinas y locales, a domicilio y a cualquier hora.',
    opens: ['entrada'],
    service: 'Apertura de casa, oficina o local',
  },
  {
    id: 'individual',
    label: 'Llave individual',
    hint: 'Abre su puerta',
    title: 'Una llave para cada puerta',
    text: 'Cada persona entra solo donde le corresponde. Hacemos copias y confección de todo tipo de llaves, con o sin muestra.',
    opens: ['oficina'],
    service: 'Copias de llaves',
  },
  {
    id: 'maestra',
    label: 'Llave maestra',
    hint: 'Abre todas',
    title: 'Amaestramiento',
    text: 'Reduzca el número de llaves y tenga el control de los accesos: llaves individuales y una maestra para cerraduras, chapas y candados.',
    opens: ['entrada', 'oficina', 'habitacion', 'bodega'],
    service: 'Amaestramiento de cerraduras',
  },
  {
    id: 'cambio',
    label: 'Cambio de combinación',
    hint: 'La anterior deja de abrir',
    title: 'Cambio de combinación',
    text: 'Si perdió una llave o cambió de inquilino, cambiamos la combinación de su cerradura: la llave anterior deja de abrir y usted recibe llaves nuevas.',
    opens: ['entrada'],
    service: 'Cambio de combinación de cerraduras',
  },
];

/** Shown under the interactive plan: the rest of the residential offer. */
export const residentialExtras =
  'También: reparación, venta e instalación de cerraduras, llavines y candados, y extracción de llaves quebradas sin desarmar el llavín.';
