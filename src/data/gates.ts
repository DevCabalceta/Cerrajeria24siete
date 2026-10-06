/**
 * Electric gates, from the current site: "Servicio de Portones Eléctricos",
 * "Mantenimiento preventivo y reparación de portones y motores eléctricos",
 * "Venta e instalación de motores de cremallera, cadena y pistones" and
 * "Venta y programación de controles para portones eléctricos".
 */

export type MotorId = 'cremallera' | 'cadena' | 'pistones';

export interface Motor {
  id: MotorId;
  label: string;
  gate: string;
  note: string;
}

export const motors: ReadonlyArray<Motor> = [
  { id: 'cremallera', label: 'Cremallera', gate: 'Portón corredizo', note: 'Un piñón engrana con la cremallera fijada al portón.' },
  { id: 'cadena', label: 'Cadena', gate: 'Portón corredizo', note: 'La catarina del motor tira de una cadena tensada a lo largo del portón.' },
  { id: 'pistones', label: 'Pistones', gate: 'Portón batiente', note: 'Dos brazos empujan cada hoja sobre su bisagra.' },
];

export interface GateService {
  title: string;
  text: string;
  message: string;
}

export const gateServices: ReadonlyArray<GateService> = [
  {
    title: 'Restauración y reparación',
    text: 'Devolvemos a su portón el funcionamiento que tenía.',
    message: 'Reparación de portón eléctrico',
  },
  {
    title: 'Mantenimiento preventivo',
    text: 'De portones y motores eléctricos, para hogares y empresas.',
    message: 'Mantenimiento de portón eléctrico',
  },
  {
    title: 'Motores',
    text: 'Venta e instalación de motores de cremallera, cadena y pistones.',
    message: 'Venta e instalación de motor para portón',
  },
  {
    title: 'Controles',
    text: 'Venta y programación de controles para abrir y cerrar su portón a distancia.',
    message: 'Control para portón eléctrico',
  },
];
