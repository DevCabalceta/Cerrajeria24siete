import type { ImageMetadata } from 'astro';
import aperturaVehiculo from '../assets/images/works/apertura-vehiculo.jpg';
import cajaFuerteDigital from '../assets/images/works/caja-fuerte-digital.jpg';
import cajaFuerteGrande from '../assets/images/works/caja-fuerte-grande.jpg';
import duplicadoLlaves from '../assets/images/works/duplicado-llaves.jpg';
import llavesConChip from '../assets/images/works/llaves-con-chip.jpg';
import motorPortonTaller from '../assets/images/works/motor-porton-taller.jpg';
import portonBatiente from '../assets/images/works/porton-batiente.jpg';
import portonPistones from '../assets/images/works/porton-pistones.jpg';

/**
 * Photos from the "Algunos de nuestros trabajos" gallery of the current site
 * (cerrajeria24siete.com, uploaded 2023-08). Re-encoded to fix orientation and
 * strip EXIF metadata. Captions describe only what each photo shows.
 * Manufacturer product shots from that gallery were left out.
 */
export interface Work {
  image: ImageMetadata;
  title: string;
  category: string;
  alt: string;
}

export const works: ReadonlyArray<Work> = [
  {
    image: aperturaVehiculo,
    title: 'Apertura de vehículo',
    category: 'Automotriz',
    alt: 'Cerrajero abriendo la puerta de un carro con una cuña de aire en el marco de la ventana.',
  },
  {
    image: portonPistones,
    title: 'Motor de pistones en portón',
    category: 'Portones',
    alt: 'Técnico instalando el brazo de un motor de pistones en un portón de madera.',
  },
  {
    image: cajaFuerteDigital,
    title: 'Caja fuerte digital',
    category: 'Cajas fuertes',
    alt: 'Técnico trabajando en una caja fuerte roja con teclado digital.',
  },
  {
    image: llavesConChip,
    title: 'Llaves con chip y mandos',
    category: 'Automotriz',
    alt: 'Colección de llaves y mandos de carro dispuestos en círculo sobre una mesa de madera.',
  },
  {
    image: motorPortonTaller,
    title: 'Motor de portón en taller',
    category: 'Portones',
    alt: 'Técnico revisando un motor de portón eléctrico sobre una mesa de trabajo.',
  },
  {
    image: duplicadoLlaves,
    title: 'Duplicado de llaves',
    category: 'Llaves',
    alt: 'Máquina duplicadora cortando una llave.',
  },
  {
    image: cajaFuerteGrande,
    title: 'Caja fuerte de gran formato',
    category: 'Cajas fuertes',
    alt: 'Técnico frente a una caja fuerte metálica de gran tamaño en una bodega.',
  },
  {
    image: portonBatiente,
    title: 'Portón batiente automático',
    category: 'Portones',
    alt: 'Portón batiente de dos hojas con brazos automáticos.',
  },
];
