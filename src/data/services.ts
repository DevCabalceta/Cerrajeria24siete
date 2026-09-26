import residentialImage from '../assets/images/services/residential-locksmith.webp';
import automotiveImage from '../assets/images/services/automotive-key-cutting.webp';
import safeImage from '../assets/images/services/safe-service.webp';
import gateImage from '../assets/images/services/electric-gate-service.webp';
import commercialImage from '../assets/images/services/commercial-service.webp';
import residentialMobileImage from '../assets/images/services/residential-locksmith.jpg';
import automotiveMobileImage from '../assets/images/services/automotive-key-cutting.png';
import safeMobileImage from '../assets/images/services/safe-service.jpeg';
import gateMobileImage from '../assets/images/services/electric-gate-service.jpeg';
import commercialMobileImage from '../assets/images/services/commercial-service.jpeg';

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
		mobileImage: residentialMobileImage,
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
		mobileImage: automotiveMobileImage,
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
		mobileImage: safeMobileImage,
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
		mobileImage: gateMobileImage,
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
		mobileImage: commercialMobileImage,
		imageAlt: 'Técnico atendiendo un sistema de acceso en una instalación comercial',
		accent: '#ffaaa2',
	},
] as const;

export const SPECIALIZED_SERVICES = [
	{
		question: '¿Pueden extraer una llave quebrada de la cerradura?',
		answer: 'Sí. Revisamos el estado del cilindro y retiramos el fragmento con herramientas adecuadas. Si el mecanismo quedó dañado, te explicamos las opciones de reparación o cambio.',
	},
	{
		question: '¿Hacen copias de llaves si no tengo una muestra?',
		answer: 'Podemos evaluar si es posible confeccionar una llave a partir de la cerradura o de la información disponible. La solución depende del tipo de llave y del estado del mecanismo.',
	},
	{
		question: '¿Programan llaves de vehículo con chip?',
		answer: 'Sí. Primero identificamos el tipo de llave y la compatibilidad del vehículo para determinar si necesita confección, programación o ambas.',
	},
	{
		question: '¿Pueden abrir un candado bloqueado?',
		answer: 'Sí. Evaluamos el modelo y su estado para elegir el método de apertura más adecuado y explicarte si conviene repararlo o sustituirlo.',
	},
	{
		question: '¿Tienen controles y carcasas para llaves?',
		answer: 'Ofrecemos controles y carcasas. Revisamos la compatibilidad antes de recomendar un reemplazo o la programación de un control nuevo.',
	},
	{
		question: '¿Qué es el amaestramiento de cerraduras?',
		answer: 'Es una forma de organizar varios accesos para que determinadas llaves abran puertas específicas. Evaluamos el sistema existente y la distribución que necesitas.',
	},
	{
		question: '¿Pueden cambiar la combinación de una caja fuerte?',
		answer: 'Sí. Atendemos cajas fuertes mecánicas y digitales; revisamos el mecanismo para definir el procedimiento de cambio de combinación apropiado.',
	},
	{
		question: '¿Reparan cerraduras que se traban o fallan?',
		answer: 'Sí. Inspeccionamos la cerradura para identificar el problema y determinar si puede repararse o si es más conveniente reemplazarla.',
	},
	{
		question: '¿Programan controles de portones eléctricos?',
		answer: 'Sí. Revisamos el motor y el sistema de recepción para confirmar la compatibilidad del control y realizar la programación correspondiente.',
	},
] as const;
