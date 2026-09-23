import { gsap } from 'gsap';

const MENU_STATE_KEY = '__cerrajeriaMenuOpen';

export function initNavigation() {
	const header = document.querySelector<HTMLElement>('[data-site-header]');
	const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
	const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');

	if (!header || !toggle || !menu || toggle.dataset.ready === 'true') return;

	toggle.dataset.ready = 'true';
	const menuItems = gsap.utils.toArray<HTMLElement>('[data-menu-link]', menu);
	const menuFooter = menu.querySelector<HTMLElement>('[data-menu-footer]');
	const focusableSelector = 'a[href], button:not([disabled])';
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let isOpen = false;
	let lastFocused: HTMLElement | null = null;
	let scrollTicking = false;

	const updateHeader = () => {
		header.classList.toggle('is-scrolled', window.scrollY > 24);
		scrollTicking = false;
	};

	const onScroll = () => {
		if (scrollTicking) return;
		scrollTicking = true;
		window.requestAnimationFrame(updateHeader);
	};

	const focusFirstLink = () => {
		menu.querySelector<HTMLElement>(focusableSelector)?.focus();
	};

	const setMenuState = (open: boolean) => {
		isOpen = open;
		toggle.setAttribute('aria-expanded', String(open));
		toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
		menu.setAttribute('aria-hidden', String(!open));
		menu.toggleAttribute('inert', !open);
		header.classList.toggle('is-menu-open', open);
		document.body.classList.toggle('menu-open', open);
	};

	const openMenu = () => {
		if (isOpen) return;
		lastFocused = document.activeElement as HTMLElement | null;
		setMenuState(true);
		menu.style.visibility = 'visible';

		if (!history.state?.[MENU_STATE_KEY]) {
			history.pushState({ ...history.state, [MENU_STATE_KEY]: true }, '');
		}

		const timeline = gsap.timeline({
			defaults: { ease: 'power3.out' },
			onComplete: focusFirstLink,
		});

		timeline
			.fromTo(
				menu,
				{ clipPath: 'inset(0 0 100% 0)' },
				{ clipPath: 'inset(0 0 0% 0)', duration: reducedMotion.matches ? 0 : 0.72 },
			)
			.fromTo(
				menuItems,
				{ yPercent: 115, opacity: 0 },
				{
					yPercent: 0,
					opacity: 1,
					duration: reducedMotion.matches ? 0 : 0.68,
					stagger: reducedMotion.matches ? 0 : 0.115,
				},
				reducedMotion.matches ? 0 : '-=0.42',
			)
			.fromTo(
				menuFooter,
				{ opacity: 0, y: 12 },
				{ opacity: 1, y: 0, duration: reducedMotion.matches ? 0 : 0.4 },
				reducedMotion.matches ? 0 : '-=0.25',
			);
	};

	const closeMenu = (restoreFocus = true) => {
		if (!isOpen) return;

		gsap.timeline({
			onComplete: () => {
				setMenuState(false);
				menu.style.visibility = 'hidden';
				gsap.set([menu, ...menuItems, menuFooter], { clearProps: 'all' });
				if (restoreFocus) lastFocused?.focus();
			},
		})
			.to(menuItems, {
				yPercent: -35,
				opacity: 0,
				duration: reducedMotion.matches ? 0 : 0.22,
				stagger: 0.02,
				ease: 'power2.in',
			})
			.to(menu, {
				clipPath: 'inset(0 0 100% 0)',
				duration: reducedMotion.matches ? 0 : 0.52,
				ease: 'power3.inOut',
			}, reducedMotion.matches ? 0 : '-=0.08');
	};

	const requestClose = () => {
		if (history.state?.[MENU_STATE_KEY]) history.back();
		else closeMenu();
	};

	const onKeydown = (event: KeyboardEvent) => {
		if (!isOpen) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			requestClose();
			return;
		}

		if (event.key !== 'Tab') return;
		const focusable = [...menu.querySelectorAll<HTMLElement>(focusableSelector), toggle];
		const first = focusable[0];
		const last = focusable.at(-1);
		if (!first || !last) return;

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};

	toggle.addEventListener('click', () => (isOpen ? requestClose() : openMenu()));
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('popstate', () => closeMenu(false));
	window.addEventListener('resize', () => {
		if (isOpen && window.matchMedia('(min-width: 68.01rem)').matches) {
			history.replaceState({ ...history.state, [MENU_STATE_KEY]: undefined }, '');
			closeMenu(false);
		}
	}, { passive: true });
	document.addEventListener('keydown', onKeydown);

	menu.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
		link.addEventListener('click', () => {
			history.replaceState({ ...history.state, [MENU_STATE_KEY]: undefined }, '');
			closeMenu(false);
		});
	});

	updateHeader();
}
