import { gsap, hasReducedMotion, MOTION_MEDIA, type MotionCleanup } from './motion';

export function initHero(): MotionCleanup {
	const hero = document.querySelector<HTMLElement>('[data-hero]');
	if (!hero || hero.dataset.ready === 'true') return () => undefined;

	hero.dataset.ready = 'true';
	const lines = gsap.utils.toArray<HTMLElement>('[data-hero-line]', hero);
	const eyebrow = hero.querySelector<HTMLElement>('[data-hero-eyebrow]');
	const description = hero.querySelector<HTMLElement>('[data-hero-description]');
	const actions = hero.querySelector<HTMLElement>('[data-hero-actions]');
	const support = gsap.utils.toArray<HTMLElement>('[data-hero-support]', hero);
	const media = hero.querySelector<HTMLElement>('[data-hero-media]');

	if (hasReducedMotion()) {
		return () => delete hero.dataset.ready;
	}

	const responsive = gsap.matchMedia();
	const context = gsap.context(() => {
		gsap.set(eyebrow, { autoAlpha: 0, y: 14 });
		gsap.set(lines, { autoAlpha: 0, y: 16 });
		gsap.set(description, { autoAlpha: 0, y: 18 });
		gsap.set(actions, { autoAlpha: 0, y: 16 });
		gsap.set(support, { autoAlpha: 0, y: 12 });

		gsap.timeline({ defaults: { ease: 'power3.out' } })
			.to(eyebrow, {
				autoAlpha: 1,
				y: 0,
				duration: 0.55,
				clearProps: 'opacity,transform,visibility',
			}, 0)
			.to(lines, {
				autoAlpha: 1,
				y: 0,
				duration: 0.72,
				stagger: 0.085,
				clearProps: 'opacity,transform,visibility',
			}, 0.03)
			.to(description, {
				autoAlpha: 1,
				y: 0,
				duration: 0.7,
				clearProps: 'opacity,transform,visibility',
			}, 0.28)
			.to(actions, {
				autoAlpha: 1,
				y: 0,
				duration: 0.7,
				clearProps: 'opacity,transform,visibility',
			}, 0.4)
			.to(support, {
				autoAlpha: 1,
				y: 0,
				duration: 0.65,
				stagger: 0.06,
				clearProps: 'opacity,transform,visibility',
			}, 0.48);

		responsive.add(MOTION_MEDIA.sectionDesktop, () => {
			if (!media) return;
			gsap.fromTo(
				media,
				{ scale: 1.04 },
				{
					scale: 1.12,
					yPercent: 4,
					ease: 'none',
					immediateRender: false,
					scrollTrigger: {
						id: 'hero-media-parallax',
						trigger: hero,
						start: 'top top',
						end: 'bottom top',
						scrub: 0.7,
					},
				},
			);
		});
	}, hero);

	return () => {
		responsive.revert();
		context.revert();
		delete hero.dataset.ready;
	};
}
