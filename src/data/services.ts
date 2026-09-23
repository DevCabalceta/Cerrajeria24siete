import residentialImage from '../assets/images/services/residential-locksmith.jpg';
import automotiveImage from '../assets/images/services/automotive-key-cutting.png';
import safeImage from '../assets/images/services/safe-service.jpeg';
import gateImage from '../assets/images/services/electric-gate-service.jpeg';
import commercialImage from '../assets/images/services/commercial-service.jpeg';

export const SERVICES = [
	{
		number: '01',
		slug: 'residencial',
		category: 'Hogar',
		title: 'Cerrajería residencial',
		description:
			'Apertura de casas, reparación, cambio e instalación de cerraduras con atención profesional a domicilio.',
		features: ['Apertura de puertas', 'Cambio de combinación', 'Instalación y reparación'],
		image: residentialImage,
		imageAlt: 'Instalación profesional de una cerradura residencial',
		accent: '#83d6ff',
	},
	{
		number: '02',
		slug: 'automotriz',
		category: 'Vehículos',
		title: 'Cerrajería automotriz',
		description:
			'Apertura segura de vehículos, reparación de llavines y confección o programación de llaves con chip.',
		features: ['Apertura 24/7', 'Llaves con chip', 'Controles y carcasas'],
		image: automotiveImage,
		imageAlt: 'Máquina profesional utilizada para confeccionar llaves de vehículos',
		accent: '#9be7c0',
	},
	{
		number: '03',
		slug: 'cajas-fuertes',
		category: 'Protección',
		title: 'Cajas fuertes',
		description:
			'Apertura de cajas fuertes digitales y mecánicas, reparación y cambio de combinación con técnicas especializadas.',
		features: ['Apertura sin daño', 'Cambio de combinación', 'Reparación'],
		image: safeImage,
		imageAlt: 'Técnico realizando un trabajo especializado en una caja fuerte industrial',
		accent: '#f4c77b',
	},
	{
		number: '04',
		slug: 'portones',
		category: 'Automatización',
		title: 'Portones eléctricos',
		description:
			'Reparación y mantenimiento de portones, instalación de motores y programación de controles remotos.',
		features: ['Mantenimiento preventivo', 'Motores eléctricos', 'Programación de controles'],
		image: gateImage,
		imageAlt: 'Técnico dando mantenimiento al motor de un portón eléctrico',
		accent: '#c5b6ff',
	},
	{
		number: '05',
		slug: 'comercial',
		category: 'Empresas',
		title: 'Cerrajería comercial',
		description:
			'Soluciones para oficinas y locales, desde aperturas hasta sistemas organizados de acceso y amaestramiento.',
		features: ['Oficinas y locales', 'Amaestramiento', 'Accesos controlados'],
		image: commercialImage,
		imageAlt: 'Técnico atendiendo un sistema de acceso en una instalación comercial',
		accent: '#ffaaa2',
	},
] as const;

export const SPECIALIZED_SERVICES = [
	'Extracción de llaves quebradas',
	'Copias con o sin muestra',
	'Programación de llaves con chip',
	'Apertura de candados',
	'Venta de controles y carcasas',
	'Amaestramiento de cerraduras',
] as const;
