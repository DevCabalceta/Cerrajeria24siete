import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initServices() {
	const section = document.querySelector<HTMLElement>('[data-services]');
	if (!section || section.dataset.ready === 'true') return;

	section.dataset.ready = 'true';
	const scrollArea = section.querySelector<HTMLElement>('[data-services-scroll]');
	const sticky = section.querySelector<HTMLElement>('[data-services-sticky]');
	const track = section.querySelector<HTMLElement>('[data-services-track]');
	const cards = gsap.utils.toArray<HTMLElement>('[data-service-card]', section);
	const introItems = gsap.utils.toArray<HTMLElement>('[data-services-intro]', section);
	const specializedItems = gsap.utils.toArray<HTMLElement>('[data-specialized-item]', section);
	const progress = section.querySelector<HTMLElement>('[data-services-progress]');
	const current = section.querySelector<HTMLElement>('[data-services-current]');
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (!scrollArea || !sticky || !track || cards.length === 0) return;

	if (reduceMotion) {
		section.classList.add('is-static');
		return;
	}

	const context = gsap.context(() => {
		gsap.from(introItems, {
			y: 45,
			opacity: 0,
			duration: 0.9,
			stagger: 0.1,
			ease: 'power3.out',
			scrollTrigger: {
				trigger: section,
				start: 'top 72%',
				once: true,
			},
		});

		const media = gsap.matchMedia();

		media.add('(min-width: 901px)', () => {
			const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);
			const horizontalTween = gsap.to(track, {
				x: () => -getDistance(),
				ease: 'none',
				scrollTrigger: {
					trigger: scrollArea,
					start: 'top top',
					end: () => `+=${getDistance()}`,
					pin: sticky,
					// The section transition transforms the ancestor; reparenting keeps the fixed pin isolated.
					pinReparent: true,
					scrub: 0.85,
					anticipatePin: 1,
					invalidateOnRefresh: true,
					onUpdate: (self) => {
						if (progress) gsap.set(progress, { scaleX: self.progress });
						if (current) {
							const activeIndex = Math.min(
								cards.length,
								Math.round(self.progress * (cards.length - 1)) + 1,
							);
							current.textContent = String(activeIndex).padStart(2, '0');
						}
					},
				},
			});

			cards.forEach((card) => {
				const image = card.querySelector('img');
				if (!image) return;
				gsap.fromTo(
					image,
					{ xPercent: -4, scale: 1.08 },
					{
						xPercent: 4,
						scale: 1.02,
						ease: 'none',
						scrollTrigger: {
							trigger: card,
							containerAnimation: horizontalTween,
							start: 'left right',
							end: 'right left',
							scrub: true,
						},
					},
				);
			});

			return () => horizontalTween.kill();
		});

		media.add('(max-width: 900px)', () => {
			cards.forEach((card) => {
				gsap.from(card, {
					y: 55,
					opacity: 0,
					duration: 0.8,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: card,
						start: 'top 84%',
						once: true,
					},
				});
			});
		});

		specializedItems.forEach((item) => {
			gsap.from(item, {
				y: 24,
				opacity: 0,
				duration: 0.65,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: item,
					start: 'top 88%',
					once: true,
				},
			});
		});
	}, section);

	window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
	window.addEventListener('pagehide', () => context.revert(), { once: true });
}
