export const SITE = {
	name: 'Cerrajería24siete',
	shortName: '24SIETE',
	url: 'https://cerrajeria24siete.com',
	email: 'servicioalcliente@cerrajeria24siete.com',
	phone: {
		display: '+506 8355-7575',
		international: '+50683557575',
		href: 'tel:+50683557575',
	},
	whatsapp: {
		href: 'https://wa.me/50683557575?text=Hola%20Cerrajer%C3%ADa24siete%2C%20necesito%20ayuda%20con%20un%20servicio%20de%20cerrajer%C3%ADa.',
		label: 'Solicitar ayuda',
	},
	coverage: ['Heredia', 'San José', 'Alajuela', 'Gran Área Metropolitana', 'Costa Rica'],
	seo: {
		title: 'Cerrajería 24/7 en Costa Rica | Cerrajería24siete',
		description:
			'Cerrajería profesional a domicilio las 24 horas en Costa Rica. Apertura de casas, vehículos y cajas fuertes, llaves, cerraduras y portones eléctricos.',
	},
} as const;

export const NAVIGATION_ITEMS = [
	{ label: 'Inicio', href: '#inicio' },
	{ label: 'Servicios', href: '#servicios' },
	{ label: 'Cobertura', href: '#cobertura' },
	{ label: 'Nosotros', href: '#nosotros' },
	{ label: 'Contacto', href: '#contacto' },
] as const;
