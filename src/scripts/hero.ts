import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHero() {
	const hero = document.querySelector<HTMLElement>('[data-hero]');
	if (!hero || hero.dataset.ready === 'true') return;

	hero.dataset.ready = 'true';
	const lines = gsap.utils.toArray<HTMLElement>('[data-hero-line]', hero);
	const reveals = gsap.utils.toArray<HTMLElement>('[data-hero-reveal]', hero);
	const media = hero.querySelector<HTMLElement>('[data-hero-media]');
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (reduceMotion) {
		gsap.set([...lines, ...reveals], { clearProps: 'all' });
		return;
	}

	const context = gsap.context(() => {
		const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.12 });
		intro
			.from(reveals, { opacity: 0, y: 18, duration: 0.75, stagger: 0.09 })
			.from(lines, { yPercent: 110, duration: 1.05, stagger: 0.095 }, '-=0.58');

		gsap.matchMedia().add('(min-width: 769px)', () => {
			if (!media) return;
			gsap.fromTo(
				media,
				{ scale: 1.04 },
				{
					scale: 1.12,
					yPercent: 4,
					ease: 'none',
					scrollTrigger: {
						trigger: hero,
						start: 'top top',
						end: 'bottom top',
						scrub: 0.7,
					},
				},
			);
		});
	}, hero);

	window.addEventListener('pagehide', () => context.revert(), { once: true });
}
