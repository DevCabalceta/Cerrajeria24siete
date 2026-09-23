import { gsap, hasReducedMotion, MOTION_MEDIA, type MotionCleanup } from './motion';

type TransitionSettings = {
	scale: number;
	opacity: number;
	blur: number;
	end: string;
	scrub: number;
};

export function initSectionTransitions(): MotionCleanup {
	const root = document.documentElement;
	const panels = gsap.utils.toArray<HTMLElement>('[data-section-panel]');
	if (panels.length < 2 || root.dataset.transitionsReady === 'true') return () => undefined;

	root.dataset.transitionsReady = 'true';
	if (hasReducedMotion()) {
		return () => delete root.dataset.transitionsReady;
	}

	const responsive = gsap.matchMedia();
	const context = gsap.context(() => {
		const createTransitions = (settings: TransitionSettings) => {
			panels.slice(0, -1).forEach((panel, index) => {
				const nextPanel = panels[index + 1];
				const surface =
					panel.querySelector<HTMLElement>('[data-section-transition-surface]') ?? panel;

				surface.style.transformOrigin = 'center bottom';
				gsap.to(surface, {
					scale: settings.scale,
					opacity: settings.opacity,
					filter: `blur(${settings.blur}px)`,
					ease: 'none',
					immediateRender: false,
					scrollTrigger: {
						id: `section-transition-${index + 1}`,
						trigger: nextPanel,
						start: 'top bottom',
						end: settings.end,
						scrub: settings.scrub,
						invalidateOnRefresh: true,
						onToggle: (self) => {
							surface.classList.toggle('is-section-transitioning', self.isActive);
						},
						onLeaveBack: () => {
							surface.classList.remove('is-section-transitioning');
							gsap.set(surface, { clearProps: 'filter,opacity,transform' });
						},
					},
				});
			});
		};

		responsive.add(MOTION_MEDIA.sectionDesktop, () => {
			createTransitions({ scale: 0.92, opacity: 0.28, blur: 12, end: 'top 14%', scrub: 0.65 });
		});

		responsive.add(MOTION_MEDIA.sectionMobile, () => {
			createTransitions({ scale: 0.96, opacity: 0.42, blur: 5, end: 'top 18%', scrub: 0.5 });
		});
	});

	return () => {
		responsive.revert();
		context.revert();
		panels.forEach((panel) => {
			const surface = panel.querySelector<HTMLElement>('[data-section-transition-surface]') ?? panel;
			surface.classList.remove('is-section-transitioning');
			surface.style.transformOrigin = '';
		});
		delete root.dataset.transitionsReady;
	};
}
