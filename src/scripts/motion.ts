import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type MotionCleanup = () => void;

export const MOTION_MEDIA = {
	reduced: '(prefers-reduced-motion: reduce)',
	sectionDesktop: '(min-width: 769px)',
	sectionMobile: '(max-width: 768px)',
	servicesDesktop: '(min-width: 901px)',
	servicesMobile: '(max-width: 900px)',
} as const;

export const hasReducedMotion = () => window.matchMedia(MOTION_MEDIA.reduced).matches;

export { gsap, ScrollTrigger };
