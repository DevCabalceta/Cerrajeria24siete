import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCoverage() {
	const section = document.querySelector<HTMLElement>('[data-coverage]');
	if (!section || section.dataset.ready === 'true') return;

	section.dataset.ready = 'true';
	const visual = section.querySelector<HTMLElement>('[data-coverage-map]');
	const land = section.querySelector<HTMLElement>('.map-land');
	const reveals = gsap.utils.toArray<HTMLElement>('[data-coverage-reveal]', section);
	const areas = gsap.utils.toArray<HTMLButtonElement>('[data-coverage-area]', section);
	const panel = section.querySelector<HTMLElement>('[data-coverage-panel]');
	const closeButton = section.querySelector<HTMLButtonElement>('[data-coverage-close]');
	const instruction = section.querySelector<HTMLElement>('[data-map-instruction]');
	const regions = gsap.utils.toArray<HTMLElement>('[data-coverage-region]', section);
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (!visual || !land || !panel || !closeButton) return;

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

	const moveGlow = (event: PointerEvent) => {
		const bounds = visual.getBoundingClientRect();
		const x = ((event.clientX - bounds.left) / bounds.width) * 100;
		const y = ((event.clientY - bounds.top) / bounds.height) * 100;
		visual.style.setProperty('--pointer-x', `${Math.max(0, Math.min(100, x))}%`);
		visual.style.setProperty('--pointer-y', `${Math.max(0, Math.min(100, y))}%`);
	};

	const resetGlow = () => {
		visual.style.setProperty('--pointer-x', '50%');
		visual.style.setProperty('--pointer-y', '50%');
	};

	if (!reduceMotion) {
		visual.addEventListener('pointermove', moveGlow);
		visual.addEventListener('pointerleave', resetGlow);
	}

	const context = reduceMotion ? undefined : gsap.context(() => {
		gsap.from(reveals, {
			y: 42,
			opacity: 0,
			duration: 0.9,
			stagger: 0.09,
			ease: 'power3.out',
			scrollTrigger: {
				trigger: section,
				start: 'top 68%',
				once: true,
			},
		});

		const mapTimeline = gsap.timeline({
			scrollTrigger: {
				trigger: visual,
				start: 'top 82%',
				once: true,
			},
		});

		mapTimeline
			.from(land, {
				scale: 0.78,
				rotation: -3,
				opacity: 0,
				duration: 1.25,
				ease: 'power3.out',
			})
			.from(
				'.map-orbit, .map-coordinate, .gam-radius',
				{ scale: 0.78, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out' },
				'-=0.72',
			)
			.from(
				areas,
				{ scale: 0, opacity: 0, duration: 0.6, stagger: 0.16, ease: 'back.out(1.8)' },
				'-=0.4',
			);

		gsap.to(land, {
			yPercent: -5,
			scale: 1.035,
			ease: 'none',
			scrollTrigger: {
				trigger: section,
				start: 'top bottom',
				end: 'bottom top',
				scrub: 0.8,
			},
		});
	}, section);

	window.addEventListener(
		'pagehide',
		() => {
			visual.removeEventListener('pointermove', moveGlow);
			visual.removeEventListener('pointerleave', resetGlow);
			areaHandlers.forEach(({ area, handler }) => area.removeEventListener('click', handler));
			closeButton.removeEventListener('click', handleClose);
			document.removeEventListener('keydown', handleKeydown);
			context?.revert();
		},
		{ once: true },
	);
}
