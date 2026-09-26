import { gsap, hasReducedMotion, ScrollTrigger, type MotionCleanup } from './motion';

type AccordionItem = {
	details: HTMLDetailsElement;
	summary: HTMLElement;
	answer: HTMLElement;
	inner: HTMLElement;
	expanded: boolean;
	animation: gsap.core.Timeline | null;
	onClick: (event: MouseEvent) => void;
};

export function initSpecializedAccordion(): MotionCleanup {
	const section = document.querySelector<HTMLElement>('[data-specialized-accordion]');
	if (!section) return () => undefined;

	const items: AccordionItem[] = [];
	const animateItem = (item: AccordionItem, shouldOpen: boolean) => {
		const { details, answer, inner } = item;
		const wasClosed = !details.open;
		const currentHeight = wasClosed ? 0 : answer.getBoundingClientRect().height;
		item.animation?.kill();
		item.animation = null;
		item.expanded = shouldOpen;
		details.classList.toggle('is-open', shouldOpen);

		if (hasReducedMotion()) {
			details.open = shouldOpen;
			gsap.set(answer, { clearProps: 'height' });
			gsap.set(inner, { clearProps: 'opacity,transform' });
			ScrollTrigger.refresh(true);
			return;
		}

		if (wasClosed) {
			details.open = true;
			gsap.set(inner, { opacity: 0, y: -7 });
		}
		gsap.set(answer, { height: currentHeight });

		item.animation = gsap.timeline({
			onComplete: () => {
				item.animation = null;
				if (!shouldOpen) details.open = false;
				gsap.set(answer, { clearProps: 'height' });
				gsap.set(inner, { clearProps: 'opacity,transform' });
				ScrollTrigger.refresh(true);
			},
		});
		item.animation
			.to(answer, { height: shouldOpen ? inner.offsetHeight : 0, duration: 0.42, ease: 'power2.inOut' }, 0)
			.to(inner, { opacity: shouldOpen ? 1 : 0, y: shouldOpen ? 0 : -7, duration: 0.3, ease: 'power2.out' }, shouldOpen ? 0.06 : 0);
	};

	section.querySelectorAll<HTMLDetailsElement>('[data-specialized-details]').forEach((details) => {
		const summary = details.querySelector<HTMLElement>('summary');
		const answer = details.querySelector<HTMLElement>('.specialized-answer');
		const inner = details.querySelector<HTMLElement>('.specialized-answer-inner');
		if (!summary || !answer || !inner) return;

		const item: AccordionItem = {
			details,
			summary,
			answer,
			inner,
			expanded: details.open,
			animation: null,
			onClick: (event) => {
				event.preventDefault();
				const shouldOpen = !item.expanded;
				if (shouldOpen) {
					items.forEach((other) => {
						if (other !== item && other.expanded) animateItem(other, false);
					});
				}
				animateItem(item, shouldOpen);
			},
		};

		details.classList.toggle('is-open', details.open);
		summary.addEventListener('click', item.onClick);
		items.push(item);
	});

	return () => {
		items.forEach((item) => {
			item.summary.removeEventListener('click', item.onClick);
			item.animation?.kill();
			gsap.set(item.answer, { clearProps: 'height' });
			gsap.set(item.inner, { clearProps: 'opacity,transform' });
		});
	};
}
