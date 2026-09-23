import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSectionTransitions() {
	const panels = gsap.utils.toArray<HTMLElement>('[data-section-panel]');
	if (panels.length < 2 || document.documentElement.dataset.transitionsReady === 'true') return;

	document.documentElement.dataset.transitionsReady = 'true';
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const context = gsap.context(() => {
		const media = gsap.matchMedia();

		media.add('(min-width: 769px)', () => {
			panels.slice(0, -1).forEach((panel, index) => {
				const nextPanel = panels[index + 1];
				gsap.to(panel, {
					scale: 0.92,
					opacity: 0.28,
					filter: 'blur(12px)',
					ease: 'none',
					scrollTrigger: {
						trigger: nextPanel,
						start: 'top bottom',
						end: 'top 14%',
						scrub: 0.65,
						invalidateOnRefresh: true,
					},
				});
			});
		});

		media.add('(max-width: 768px)', () => {
			panels.slice(0, -1).forEach((panel, index) => {
				const nextPanel = panels[index + 1];
				gsap.to(panel, {
					scale: 0.96,
					opacity: 0.42,
					filter: 'blur(5px)',
					ease: 'none',
					scrollTrigger: {
						trigger: nextPanel,
						start: 'top bottom',
						end: 'top 18%',
						scrub: 0.5,
					},
				});
			});
		});
	});

	window.addEventListener('pagehide', () => context.revert(), { once: true });
}
