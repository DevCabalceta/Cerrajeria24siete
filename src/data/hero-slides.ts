import type { ImageMetadata } from 'astro';
import keyCuttingWorkshop from '../assets/images/hero/key-cutting-workshop.png';
import stockWorkshopCraft from '../assets/images/hero/stock-workshop-craft-unsplash.jpg';
import stockDoorHardware from '../assets/images/hero/stock-door-hardware-unsplash.jpg';
import stockUnlockingDoor from '../assets/images/hero/stock-unlocking-door-unsplash.jpg';

export interface HeroSlide {
	image: ImageMetadata;
	alt: string;
	desktopPosition: string;
	mobilePosition: string;
}

export const HERO_SLIDES: HeroSlide[] = [
	{
		image: keyCuttingWorkshop,
		alt: 'Profesional trabajando en la confección de una llave',
		desktopPosition: '56% center',
		mobilePosition: '70% center',
	},
	{
		image: stockWorkshopCraft,
		alt: 'Profesional trabajando con herramientas en su taller',
		desktopPosition: '62% center',
		mobilePosition: '73% center',
	},
	{
		image: stockDoorHardware,
		alt: 'Profesional ajustando la cerradura de una puerta',
		desktopPosition: '60% center',
		mobilePosition: '60% center',
	},
	{
		image: stockUnlockingDoor,
		alt: 'Manos utilizando una llave en la cerradura de una puerta',
		desktopPosition: '57% center',
		mobilePosition: '58% center',
	},
];
