import { gsap, hasReducedMotion, MOTION_MEDIA, type MotionCleanup } from './motion';

export function initServices(): MotionCleanup {
	const section = document.querySelector<HTMLElement>('[data-services]');
	if (!section || section.dataset.ready === 'true') return () => undefined;

	section.dataset.ready = 'true';
	const scrollArea = section.querySelector<HTMLElement>('[data-services-scroll]');
	const sticky = section.querySelector<HTMLElement>('[data-services-sticky]');
	const track = section.querySelector<HTMLElement>('[data-services-track]');
	const cards = gsap.utils.toArray<HTMLElement>('[data-service-card]', section);
	const introItems = gsap.utils.toArray<HTMLElement>('[data-services-intro]', section);
	const specializedItems = gsap.utils.toArray<HTMLElement>('[data-specialized-item]', section);
	const progress = section.querySelector<HTMLElement>('[data-services-progress]');
	const current = section.querySelector<HTMLElement>('[data-services-current]');

	if (!scrollArea || !sticky || !track || cards.length === 0) {
		return () => delete section.dataset.ready;
	}

	if (hasReducedMotion()) {
		section.classList.add('is-static');
		return () => {
			section.classList.remove('is-static');
			delete section.dataset.ready;
		};
	}

	const responsive = gsap.matchMedia();
	const context = gsap.context(() => {
		gsap.set(introItems, { y: 45, opacity: 0 });
		gsap.set(specializedItems, { y: 24, opacity: 0 });

		gsap.to(introItems, {
			y: 0,
			opacity: 1,
			duration: 0.9,
			stagger: 0.1,
			ease: 'power3.out',
			clearProps: 'opacity,transform',
			scrollTrigger: {
				id: 'services-intro',
				trigger: section,
				start: 'top 72%',
				once: true,
			},
		});

		responsive.add(MOTION_MEDIA.servicesDesktop, () => {
			const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);
			const setProgress = progress ? gsap.quickSetter(progress, 'scaleX') : undefined;
			let activeIndex = 0;

			const horizontalTween = gsap.to(track, {
				x: () => -getDistance(),
				ease: 'none',
				scrollTrigger: {
					id: 'services-horizontal',
					trigger: scrollArea,
					start: 'top top',
					end: () => `+=${getDistance()}`,
					pin: sticky,
					scrub: 0.85,
					anticipatePin: 1,
					invalidateOnRefresh: true,
					onToggle: (self) => {
						track.style.willChange = self.isActive ? 'transform' : '';
					},
					onUpdate: (self) => {
						setProgress?.(self.progress);
						const nextIndex = Math.min(
							cards.length,
							Math.round(self.progress * (cards.length - 1)) + 1,
						);
						if (current && nextIndex !== activeIndex) {
							activeIndex = nextIndex;
							current.textContent = String(nextIndex).padStart(2, '0');
						}
					},
				},
			});

			cards.forEach((card, index) => {
				const image = card.querySelector('img');
				if (!image) return;
				gsap.fromTo(
					image,
					{ xPercent: -4, scale: 1.08 },
					{
						xPercent: 4,
						scale: 1.02,
						ease: 'none',
						immediateRender: false,
						scrollTrigger: {
							id: `service-image-${index + 1}`,
							trigger: card,
							containerAnimation: horizontalTween,
							start: 'left right',
							end: 'right left',
							scrub: true,
						},
					},
				);
			});

			return () => {
				track.style.willChange = '';
				horizontalTween.kill();
			};
		});

		responsive.add(MOTION_MEDIA.servicesMobile, () => {
			gsap.set(cards, { y: 55, opacity: 0 });
			cards.forEach((card, index) => {
				gsap.to(card, {
					y: 0,
					opacity: 1,
					duration: 0.8,
					ease: 'power3.out',
					clearProps: 'opacity,transform',
					scrollTrigger: {
						id: `service-card-${index + 1}`,
						trigger: card,
						start: 'top 84%',
						once: true,
					},
				});
			});
		});

		specializedItems.forEach((item, index) => {
			gsap.to(item, {
				y: 0,
				opacity: 1,
				duration: 0.65,
				ease: 'power2.out',
				clearProps: 'opacity,transform',
				scrollTrigger: {
					id: `specialized-service-${index + 1}`,
					trigger: item,
					start: 'top 88%',
					once: true,
				},
			});
		});
	}, section);

	return () => {
		responsive.revert();
		context.revert();
		delete section.dataset.ready;
	};
}
