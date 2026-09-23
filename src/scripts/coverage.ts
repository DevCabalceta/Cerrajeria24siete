import { gsap, hasReducedMotion, type MotionCleanup } from './motion';

export function initCoverage(): MotionCleanup {
	const section = document.querySelector<HTMLElement>('[data-coverage]');
	if (!section || section.dataset.ready === 'true') return () => undefined;

	section.dataset.ready = 'true';
	const visual = section.querySelector<HTMLElement>('[data-coverage-map]');
	const land = section.querySelector<HTMLElement>('[data-coverage-land]');
	const landReveal = section.querySelector<HTMLElement>('[data-coverage-land-reveal]');
	const reveals = gsap.utils.toArray<HTMLElement>('[data-coverage-reveal]', section);
	const detailItems = gsap.utils.toArray<HTMLElement>(
		'.map-orbit, .map-coordinate, .gam-radius',
		section,
	);
	const areas = gsap.utils.toArray<HTMLButtonElement>('[data-coverage-area]', section);
	const panel = section.querySelector<HTMLElement>('[data-coverage-panel]');
	const closeButton = section.querySelector<HTMLButtonElement>('[data-coverage-close]');
	const instruction = section.querySelector<HTMLElement>('[data-map-instruction]');
	const regions = gsap.utils.toArray<HTMLElement>('[data-coverage-region]', section);
	const reduceMotion = hasReducedMotion();

	if (!visual || !land || !landReveal || !panel || !closeButton) {
		return () => delete section.dataset.ready;
	}

	let lastTrigger: HTMLButtonElement | null = null;
	const openRegion = (trigger: HTMLButtonElement) => {
		const province = trigger.dataset.coverageArea;
		if (!province) return;

		lastTrigger = trigger;
		areas.forEach((area) => {
			const isActive = area === trigger;
			area.classList.toggle('is-active', isActive);
			area.setAttribute('aria-expanded', String(isActive));
		});

		let activeRegion: HTMLElement | undefined;
		regions.forEach((region) => {
			const isActive = region.dataset.coverageRegion === province;
			region.hidden = !isActive;
			if (isActive) activeRegion = region;
		});

		panel.classList.add('is-open');
		panel.setAttribute('aria-hidden', 'false');
		if (instruction) instruction.style.opacity = '0';
		panel.querySelector<HTMLElement>('.coverage-regions')?.scrollTo({ top: 0 });
		activeRegion?.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true });
	};

	const closeRegion = () => {
		panel.classList.remove('is-open');
		panel.setAttribute('aria-hidden', 'true');
		areas.forEach((area) => {
			area.classList.remove('is-active');
			area.setAttribute('aria-expanded', 'false');
		});
		if (instruction) instruction.style.opacity = '';
		lastTrigger?.focus({ preventScroll: true });
	};

	const areaHandlers = areas.map((area) => {
		const handler = () => openRegion(area);
		area.addEventListener('click', handler);
		return { area, handler };
	});
	const handleClose = () => closeRegion();
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && panel.classList.contains('is-open')) closeRegion();
	};

	closeButton.addEventListener('click', handleClose);
	document.addEventListener('keydown', handleKeydown);

	let pointerBounds: DOMRect | undefined;
	let pointerFrame = 0;
	let latestPointer: PointerEvent | undefined;
	const updatePointerGlow = () => {
		pointerFrame = 0;
		if (!pointerBounds || !latestPointer) return;
		const x = ((latestPointer.clientX - pointerBounds.left) / pointerBounds.width) * 100;
		const y = ((latestPointer.clientY - pointerBounds.top) / pointerBounds.height) * 100;
		visual.style.setProperty('--pointer-x', `${Math.max(0, Math.min(100, x))}%`);
		visual.style.setProperty('--pointer-y', `${Math.max(0, Math.min(100, y))}%`);
	};
	const handlePointerEnter = () => {
		pointerBounds = visual.getBoundingClientRect();
	};
	const handlePointerMove = (event: PointerEvent) => {
		latestPointer = event;
		if (!pointerFrame) pointerFrame = window.requestAnimationFrame(updatePointerGlow);
	};
	const handlePointerLeave = () => {
		pointerBounds = undefined;
		latestPointer = undefined;
		visual.style.setProperty('--pointer-x', '50%');
		visual.style.setProperty('--pointer-y', '50%');
	};

	if (!reduceMotion) {
		visual.addEventListener('pointerenter', handlePointerEnter);
		visual.addEventListener('pointermove', handlePointerMove);
		visual.addEventListener('pointerleave', handlePointerLeave);
	}

	const context = reduceMotion ? undefined : gsap.context(() => {
		gsap.set(reveals, { y: 42, opacity: 0 });
		gsap.set(landReveal, { scale: 0.78, rotation: -3, opacity: 0 });
		gsap.set(detailItems, { scale: 0.78, opacity: 0 });
		gsap.set(areas, { scale: 0, opacity: 0 });

		gsap.to(reveals, {
			y: 0,
			opacity: 1,
			duration: 0.9,
			stagger: 0.09,
			ease: 'power3.out',
			clearProps: 'opacity,transform',
			scrollTrigger: {
				id: 'coverage-copy',
				trigger: section,
				start: 'top 68%',
				once: true,
			},
		});

		gsap.timeline({
			scrollTrigger: {
				id: 'coverage-map-reveal',
				trigger: visual,
				start: 'top 82%',
				once: true,
			},
		})
			.to(landReveal, {
				scale: 1,
				rotation: 0,
				opacity: 1,
				duration: 1.25,
				ease: 'power3.out',
				clearProps: 'opacity,transform',
			})
			.to(
				detailItems,
				{
					scale: 1,
					opacity: 1,
					duration: 0.8,
					stagger: 0.08,
					ease: 'power2.out',
					clearProps: 'opacity,transform',
				},
				'-=0.72',
			)
			.to(
				areas,
				{
					scale: 1,
					opacity: 1,
					duration: 0.6,
					stagger: 0.16,
					ease: 'back.out(1.8)',
					clearProps: 'opacity,transform',
				},
				'-=0.4',
			);

		gsap.to(land, {
			yPercent: -5,
			scale: 1.035,
			ease: 'none',
			immediateRender: false,
			scrollTrigger: {
				id: 'coverage-map-parallax',
				trigger: section,
				start: 'top bottom',
				end: 'bottom top',
				scrub: 0.8,
				onToggle: (self) => {
					land.style.willChange = self.isActive ? 'transform' : '';
				},
			},
		});
	}, section);

	return () => {
		if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
		visual.removeEventListener('pointerenter', handlePointerEnter);
		visual.removeEventListener('pointermove', handlePointerMove);
		visual.removeEventListener('pointerleave', handlePointerLeave);
		areaHandlers.forEach(({ area, handler }) => area.removeEventListener('click', handler));
		closeButton.removeEventListener('click', handleClose);
		document.removeEventListener('keydown', handleKeydown);
		land.style.willChange = '';
		context?.revert();
		delete section.dataset.ready;
	};
}
