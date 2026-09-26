import { initCoverage } from './coverage';
import { initHero } from './hero';
import { initHeroSlider } from './hero-slider';
import { ScrollTrigger } from './motion';
import { initNavigation } from './navigation';
import { initSectionTransitions } from './section-transitions';
import { initServices } from './services';
import { initSpecializedAccordion } from './specialized-accordion';

export function initPageMotion() {
	const root = document.documentElement;
	if (root.dataset.pageMotionReady === 'true') return;

	root.dataset.pageMotionReady = 'true';
	const cleanups = [
		initNavigation(),
		initHero(),
		initHeroSlider(),
		initServices(),
		initSpecializedAccordion(),
		initCoverage(),
		initSectionTransitions(),
	].filter((cleanup): cleanup is () => void => typeof cleanup === 'function');
	root.dataset.motion = 'ready';

	let disposed = false;
	const refresh = () => {
		if (disposed) return;
		window.requestAnimationFrame(() => {
			if (!disposed) ScrollTrigger.refresh();
		});
	};

	if (document.fonts?.ready) document.fonts.ready.then(refresh);
	else if (document.readyState === 'complete') refresh();
	else window.addEventListener('load', refresh, { once: true });

	window.addEventListener(
		'pagehide',
		(event) => {
			if (event.persisted) return;
			disposed = true;
			cleanups.reverse().forEach((cleanup) => cleanup());
			delete root.dataset.pageMotionReady;
		},
		{ once: true },
	);
}
