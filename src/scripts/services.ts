import { gsap, hasReducedMotion, type MotionCleanup } from './motion';

const FRAMES_PER_SERVICE = 16;
const MAX_CANVAS_PIXELS = 2_800_000;
const MOBILE_QUERY = '(max-width: 768px)';

type Connection = { saveData?: boolean; effectiveType?: string };
type DeviceNavigator = Navigator & { deviceMemory?: number; connection?: Connection };

function shouldUseStaticExperience() {
	const device = navigator as DeviceNavigator;
	return (
		hasReducedMotion() ||
		(device.deviceMemory !== undefined && device.deviceMemory <= 2) ||
		device.connection?.saveData === true ||
		['slow-2g', '2g'].includes(device.connection?.effectiveType ?? '')
	);
}

function drawCover(
	context: CanvasRenderingContext2D,
	image: HTMLImageElement,
	width: number,
	height: number,
	phase: number,
	serviceIndex: number,
) {
	const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight);
	const zoom = 1.035 + phase * 0.115;
	const drawnWidth = image.naturalWidth * cover * zoom;
	const drawnHeight = image.naturalHeight * cover * zoom;
	const focusX = [0.54, 0.49, 0.46, 0.5, 0.47][serviceIndex] ?? 0.5;
	const focusY = [0.5, 0.48, 0.42, 0.48, 0.44][serviceIndex] ?? 0.5;
	const pan = (phase - 0.5) * 0.08;
	const x = (width - drawnWidth) * Math.min(0.85, Math.max(0.15, focusX + pan));
	const y = (height - drawnHeight) * Math.min(0.85, Math.max(0.15, focusY - pan));
	context.drawImage(image, x, y, drawnWidth, drawnHeight);
}

export function initServices(): MotionCleanup {
	const section = document.querySelector<HTMLElement>('[data-services]');
	if (!section || section.dataset.ready === 'true') return () => undefined;
	section.dataset.ready = 'true';

	const experience = section.querySelector<HTMLElement>('[data-services-experience]');
	const scene = section.querySelector<HTMLElement>('[data-services-scene]');
	const canvas = section.querySelector<HTMLCanvasElement>('[data-services-canvas]');
	const poster = section.querySelector<HTMLImageElement>('[data-services-poster]');
	const chapters = gsap.utils.toArray<HTMLElement>('[data-service-chapter]', section);
	const introItems = gsap.utils.toArray<HTMLElement>('[data-services-intro]', section);
	const specializedItems = gsap.utils.toArray<HTMLElement>('[data-specialized-item]', section);
	const progressLine = section.querySelector<HTMLElement>('[data-services-progress]');
	const currentLabel = section.querySelector<HTMLElement>('[data-services-current]');
	const context2d = canvas?.getContext('2d', { alpha: false });

	if (!experience || !scene || !canvas || !poster || !context2d || chapters.length === 0) {
		return () => delete section.dataset.ready;
	}
	const sceneElement: HTMLElement = scene;
	const canvasElement: HTMLCanvasElement = canvas;
	const drawingContext: CanvasRenderingContext2D = context2d;

	const staticMode = shouldUseStaticExperience();
	const motion = gsap.context(() => {
		if (staticMode) return;
		gsap.set(introItems, { y: 45, opacity: 0 });
		gsap.set(specializedItems, { y: 24, opacity: 0 });
		gsap.to(introItems, {
			y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out',
			clearProps: 'opacity,transform',
			scrollTrigger: { id: 'services-intro', trigger: section, start: 'top 72%', once: true },
		});
		specializedItems.forEach((item, index) => {
			gsap.to(item, {
				y: 0, opacity: 1, duration: 0.65, ease: 'power2.out',
				clearProps: 'opacity,transform',
				scrollTrigger: { id: `specialized-service-${index + 1}`, trigger: item, start: 'top 88%', once: true },
			});
		});
	}, section);

	if (staticMode) return () => { motion.revert(); delete section.dataset.ready; };

	section.classList.remove('is-static');
	section.classList.add('is-interactive');
	const media = window.matchMedia(MOBILE_QUERY);
	const declaredFrameCount = Number(canvasElement.dataset.sequenceFrameCount) || 0;
	const hasFrameFiles = declaredFrameCount > 0;
	const totalFrames = hasFrameFiles ? declaredFrameCount : chapters.length * FRAMES_PER_SERVICE;
	let sources = chapters.map((chapter) => chapter.dataset.frameDesktop ?? '');
	let images: Array<HTMLImageElement | undefined> = new Array(totalFrames);
	const queued = new Set<number>();
	const loading = new Set<number>();
	let stage = -1;
	let lastFrame = -1;
	let targetFrame = 0;
	let frameRequest = 0;
	let active = true;
	let canvasWidth = 0;
	let canvasHeight = 0;
	let canvasScale = 1;
	let queueTimer = 0;

	function scheduleFrame(force = false) {
		if (force) lastFrame = -1;
		if (frameRequest || !active) return;
		frameRequest = window.requestAnimationFrame(() => {
			frameRequest = 0;
			render(targetFrame);
		});
	}

	function loadNext() {
		if (!active || loading.size >= 2 || queued.size === 0) return;
		const priority = hasFrameFiles ? targetFrame : Math.max(0, stage);
		const next = [...queued].sort((a, b) => Math.abs(a - priority) - Math.abs(b - priority))[0];
		queued.delete(next);
		loading.add(next);
		const image = new Image();
		image.decoding = 'async';
		const source = sources[next];
		image.src = source;
		image.decode().then(() => {
			if (!active || source !== sources[next]) return;
			images[next] = image;
			if (hasFrameFiles) {
				const decoded = images.map((item, index) => item ? index : -1).filter((index) => index >= 0);
				decoded.sort((a, b) => Math.abs(a - targetFrame) - Math.abs(b - targetFrame));
				decoded.slice(14).forEach((index) => { images[index] = undefined; });
			}
			scheduleFrame(true);
		}).catch(() => {
			// El póster y las tarjetas HTML permanecen disponibles si falla una imagen.
		}).finally(() => {
			loading.delete(next);
			if (source !== sources[next]) enqueue(next);
			loadNext();
		});
		loadNext();
	}

	function enqueue(index: number) {
		if (index < 0 || index >= sources.length || images[index] || loading.has(index)) return;
		queued.add(index);
		loadNext();
	}

	function enqueueNearby(frame: number) {
		for (let offset = -2; offset <= 4; offset++) enqueue(frame + offset);
	}

	function resizeCanvas() {
		const bounds = sceneElement.getBoundingClientRect();
		const width = Math.round(bounds.width);
		const height = Math.round(bounds.height);
		if (width <= 0 || height <= 0) return;
		const scale = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(MAX_CANVAS_PIXELS / (width * height)));
		const actualWidth = Math.round(width * scale);
		const actualHeight = Math.round(height * scale);
		if (canvasElement.width === actualWidth && canvasElement.height === actualHeight) return;
		canvasElement.width = actualWidth;
		canvasElement.height = actualHeight;
		canvasWidth = width;
		canvasHeight = height;
		canvasScale = scale;
		drawingContext.setTransform(scale, 0, 0, scale, 0, 0);
		scheduleFrame(true);
	}

	function render(frame: number) {
		if (frame === lastFrame || !canvasWidth || !canvasHeight) return;
		if (hasFrameFiles) {
			const image = images[frame];
			if (!image) return;
			drawingContext.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
			drawingContext.fillStyle = '#090f18';
			drawingContext.fillRect(0, 0, canvasWidth, canvasHeight);
			drawCover(drawingContext, image, canvasWidth, canvasHeight, 0, Math.min(chapters.length - 1, Math.floor(frame / totalFrames * chapters.length)));
			lastFrame = frame;
			canvasElement.classList.add('is-ready');
			return;
		}
		const position = (frame / (totalFrames - 1)) * chapters.length;
		const index = Math.min(chapters.length - 1, Math.floor(position));
		const phase = Math.min(1, position - index);
		const image = images[index] ?? images.find((item) => item !== undefined);
		if (!image) return;
		drawingContext.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
		drawingContext.fillStyle = '#090f18';
		drawingContext.fillRect(0, 0, canvasWidth, canvasHeight);
		drawCover(drawingContext, image, canvasWidth, canvasHeight, phase, index);
		const nextImage = images[index + 1];
		if (nextImage && phase > 0.78) {
			drawingContext.globalAlpha = (phase - 0.78) / 0.22;
			drawCover(drawingContext, nextImage, canvasWidth, canvasHeight, 0, index + 1);
			drawingContext.globalAlpha = 1;
		}
		lastFrame = frame;
		canvasElement.classList.add('is-ready');
	}

	function showStage(index: number) {
		if (index === stage) return;
		if (stage >= 0) {
			chapters[stage].classList.remove('is-active');
			chapters[stage].classList.add('is-leaving');
			chapters[stage].inert = true;
		}
		chapters[index].classList.remove('is-leaving');
		chapters[index].classList.add('is-active');
		chapters[index].inert = false;
		stage = index;
		if (currentLabel) currentLabel.textContent = String(index + 1).padStart(2, '0');
		if (!hasFrameFiles) { enqueue(index); enqueue(index + 1); }
	}

	function switchSources() {
		if (hasFrameFiles) {
			const root = media.matches ? canvasElement.dataset.sequenceMobileRoot : canvasElement.dataset.sequenceDesktopRoot;
			sources = Array.from({ length: totalFrames }, (_, index) => `${root}/frame-${String(index + 1).padStart(4, '0')}.webp`);
		} else {
			sources = chapters.map((chapter) => (media.matches ? chapter.dataset.frameMobile : chapter.dataset.frameDesktop) ?? '');
		}
		images = new Array(sources.length);
		queued.clear();
		lastFrame = -1;
		canvasElement.classList.remove('is-ready');
		if (hasFrameFiles) enqueueNearby(targetFrame);
		else { enqueue(Math.max(0, stage)); enqueue(Math.min(chapters.length - 1, Math.max(0, stage) + 1)); }
	}

	const resizeObserver = new ResizeObserver(resizeCanvas);
	resizeObserver.observe(sceneElement);
	media.addEventListener('change', switchSources);
	switchSources();
	showStage(0);
	resizeCanvas();

	const progress = { frame: 0 };
	const tween = gsap.to(progress, {
		frame: totalFrames - 1,
		ease: 'none',
		scrollTrigger: {
			id: 'services-sequence',
			trigger: experience,
			start: 'top top',
			end: 'bottom bottom',
			scrub: 0.25,
			invalidateOnRefresh: true,
			onUpdate: (self) => {
				const index = Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length));
				showStage(index);
				if (progressLine) progressLine.style.transform = `scaleX(${self.progress})`;
			},
		},
		onUpdate: () => {
			const next = Math.round(progress.frame);
			if (next !== targetFrame) {
				targetFrame = next;
				if (hasFrameFiles) enqueueNearby(next);
				scheduleFrame();
			}
		},
	});

	const observer = new IntersectionObserver((entries) => {
		if (!entries[0]?.isIntersecting) return;
		if (hasFrameFiles) enqueueNearby(targetFrame);
		else {
			enqueue(0);
			enqueue(1);
			queueTimer = window.setTimeout(() => {
				for (let index = 2; index < chapters.length; index++) enqueue(index);
			}, 400);
		}
		observer.disconnect();
	}, { rootMargin: '125% 0px' });
	observer.observe(experience);

	return () => {
		active = false;
		window.cancelAnimationFrame(frameRequest);
		window.clearTimeout(queueTimer);
		observer.disconnect();
		resizeObserver.disconnect();
		media.removeEventListener('change', switchSources);
		tween.kill();
		motion.revert();
		section.classList.remove('is-interactive');
		section.classList.add('is-static');
		chapters.forEach((chapter) => { chapter.inert = false; chapter.classList.remove('is-active', 'is-leaving'); });
		delete section.dataset.ready;
	};
}
