import { gsap, hasReducedMotion, type MotionCleanup } from './motion';

const SLIDE_DURATION = 4;
const CROSSFADE_DURATION = 1;

type IdleWindow = Window & typeof globalThis & {
	requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
	cancelIdleCallback?: (handle: number) => void;
};

export function initHeroSlider(): MotionCleanup {
	const slider = document.querySelector<HTMLElement>('[data-hero-slider]');
	if (!slider || slider.dataset.ready === 'true') return () => undefined;

	const slides = gsap.utils.toArray<HTMLElement>('[data-hero-slide]', slider);
	const controls = gsap.utils.toArray<HTMLButtonElement>('[data-hero-slide-control]');
	const pauseButton = document.querySelector<HTMLButtonElement>('[data-hero-slider-toggle]');
	const progressBars = controls.map((control) => control.querySelector<HTMLElement>('[data-hero-slide-progress]'));
	if (slides.length < 2 || controls.length !== slides.length || progressBars.some((bar) => !bar) || !pauseButton) {
		return () => undefined;
	}

	slider.dataset.ready = 'true';
	const reducedMotion = hasReducedMotion();
	const idleWindow = window as IdleWindow;
	let currentIndex = 0;
	let requestVersion = 0;
	let disposed = false;
	let isPaused = false;
	let pendingAutoIndex: number | null = null;
	let preparingSlide = false;
	let progressTween: ReturnType<typeof gsap.to> | null = null;
	let transitionTimeline: ReturnType<typeof gsap.timeline> | null = null;
	let idleHandle: number | null = null;
	let preloadTimeout: number | null = null;
	const imagePreparations = new Map<number, Promise<boolean>>();

	const imageFor = (index: number) => slides[index]?.querySelector<HTMLImageElement>('img') ?? null;

	const prepareImage = (index: number) => {
		const pendingPreparation = imagePreparations.get(index);
		if (pendingPreparation) return pendingPreparation;

		const image = imageFor(index);
		if (!image) return Promise.resolve(false);

		const preparation = (async () => {
			if (image.complete) {
				if (image.naturalWidth === 0) return false;
			} else {
				image.loading = 'eager';
				await new Promise<void>((resolve) => {
					const settle = () => {
						image.removeEventListener('load', settle);
						image.removeEventListener('error', settle);
						resolve();
					};
					image.addEventListener('load', settle);
					image.addEventListener('error', settle);
				});
			}

			if (image.decode) await image.decode().catch(() => undefined);
			return image.naturalWidth > 0;
		})();

		imagePreparations.set(index, preparation);
		return preparation;
	};

	const updateActiveState = (index: number) => {
		slides.forEach((slide, slideIndex) => {
			const active = slideIndex === index;
			slide.classList.toggle('is-active', active);
			slide.setAttribute('aria-hidden', String(!active));
		});

		controls.forEach((control, controlIndex) => {
			const active = controlIndex === index;
			control.classList.toggle('is-active', active);
			if (active) control.setAttribute('aria-current', 'true');
			else control.removeAttribute('aria-current');
		});
	};

	const resetProgress = (activeIndex: number, complete = false) => {
		gsap.set(progressBars, { scaleX: 0, transformOrigin: 'left center' });
		if (complete) gsap.set(progressBars[activeIndex], { scaleX: 1 });
	};

	const startProgress = () => {
		progressTween?.kill();
		progressTween = null;
		resetProgress(currentIndex, reducedMotion);
		if (reducedMotion || document.hidden || isPaused || disposed) return;

		progressTween = gsap.to(progressBars[currentIndex], {
			scaleX: 1,
			duration: SLIDE_DURATION,
			ease: 'none',
			onComplete: () => {
				progressTween = null;
				void showSlide((currentIndex + 1) % slides.length);
			},
		});
	};

	const showSlide = async (nextIndex: number, manual = false) => {
		const normalizedIndex = ((nextIndex % slides.length) + slides.length) % slides.length;
		if (manual) pendingAutoIndex = null;
		if (normalizedIndex === currentIndex && !transitionTimeline && isPaused) return;
		const version = ++requestVersion;
		progressTween?.kill();
		progressTween = null;

		if (normalizedIndex === currentIndex && !transitionTimeline) {
			startProgress();
			return;
		}

		preparingSlide = true;
		const isReady = await prepareImage(normalizedIndex);
		preparingSlide = false;
		if (!isReady || disposed || version !== requestVersion) {
			if (!disposed && version === requestVersion && !isPaused) startProgress();
			return;
		}
		if (isPaused && !manual) {
			pendingAutoIndex = normalizedIndex;
			return;
		}

		transitionTimeline?.kill();
		transitionTimeline = null;
		const nextSlide = slides[normalizedIndex];
		const otherSlides = slides.filter((_, index) => index !== normalizedIndex);
		const startingOpacity = Number.parseFloat(getComputedStyle(nextSlide).opacity) || 0;

		currentIndex = normalizedIndex;
		updateActiveState(currentIndex);
		resetProgress(currentIndex, reducedMotion);

		if (reducedMotion) {
			gsap.set(otherSlides, { autoAlpha: 0, zIndex: 0 });
			gsap.set(nextSlide, { autoAlpha: 1, zIndex: 2 });
			return;
		}

		gsap.set(nextSlide, { autoAlpha: startingOpacity, zIndex: 2 });
		gsap.set(otherSlides, { zIndex: 1 });
		transitionTimeline = gsap.timeline({
			paused: document.hidden,
			onComplete: () => {
				gsap.set(otherSlides, { autoAlpha: 0, zIndex: 0 });
				gsap.set(nextSlide, { autoAlpha: 1, zIndex: 2 });
				transitionTimeline = null;
				startProgress();
			},
		});
		transitionTimeline
			.to(nextSlide, { autoAlpha: 1, duration: CROSSFADE_DURATION, ease: 'power2.inOut' }, 0)
			.to(otherSlides, { autoAlpha: 0, duration: CROSSFADE_DURATION, ease: 'power2.inOut' }, 0);
	};

	const handleControlClick = (event: Event) => {
		const control = event.currentTarget as HTMLButtonElement;
		const nextIndex = Number.parseInt(control.dataset.heroSlideControl ?? '', 10);
		if (Number.isNaN(nextIndex)) return;
		void showSlide(nextIndex, true);
	};

	const handlePauseClick = () => {
		isPaused = !isPaused;
		pauseButton.classList.toggle('is-paused', isPaused);
		pauseButton.setAttribute('aria-pressed', String(isPaused));
		pauseButton.setAttribute('aria-label', isPaused ? 'Reanudar presentación' : 'Pausar presentación');

		if (isPaused) {
			progressTween?.pause();
			transitionTimeline?.pause();
			return;
		}

		if (document.hidden) return;
		if (pendingAutoIndex !== null) {
			const nextIndex = pendingAutoIndex;
			pendingAutoIndex = null;
			void showSlide(nextIndex);
		} else if (transitionTimeline) transitionTimeline.resume();
		else if (progressTween) progressTween.resume();
		else if (!preparingSlide) startProgress();
	};

	const handleVisibilityChange = () => {
		if (document.hidden) {
			progressTween?.pause();
			transitionTimeline?.pause();
			return;
		}
		if (isPaused) return;

		if (pendingAutoIndex !== null) {
			const nextIndex = pendingAutoIndex;
			pendingAutoIndex = null;
			void showSlide(nextIndex);
		} else if (transitionTimeline) transitionTimeline.resume();
		else if (progressTween) progressTween.resume();
		else if (!preparingSlide) startProgress();
	};

	controls.forEach((control) => control.addEventListener('click', handleControlClick));
	pauseButton.addEventListener('click', handlePauseClick);
	document.addEventListener('visibilitychange', handleVisibilityChange);
	gsap.set(slides, { autoAlpha: 0, zIndex: 0 });
	gsap.set(slides[0], { autoAlpha: 1, zIndex: 2 });
	updateActiveState(currentIndex);
	startProgress();

	const preloadRemainingSlides = () => {
		void Promise.allSettled(slides.slice(1).map((_, index) => prepareImage(index + 1)));
	};

	if (idleWindow.requestIdleCallback) {
		idleHandle = idleWindow.requestIdleCallback(preloadRemainingSlides, { timeout: 1800 });
	} else {
		preloadTimeout = window.setTimeout(preloadRemainingSlides, 900);
	}

	return () => {
		disposed = true;
		requestVersion += 1;
		progressTween?.kill();
		transitionTimeline?.kill();
		if (idleHandle !== null) idleWindow.cancelIdleCallback?.(idleHandle);
		if (preloadTimeout !== null) window.clearTimeout(preloadTimeout);
		controls.forEach((control) => control.removeEventListener('click', handleControlClick));
		pauseButton.removeEventListener('click', handlePauseClick);
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		gsap.set([...slides, ...progressBars], { clearProps: 'all' });
		delete slider.dataset.ready;
	};
}
