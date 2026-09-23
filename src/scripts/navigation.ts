import { gsap, type MotionCleanup } from './motion';

const MENU_STATE_KEY = '__cerrajeriaMenuOpen';

export function initNavigation(): MotionCleanup {
	const header = document.querySelector<HTMLElement>('[data-site-header]');
	const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
	const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');

	if (!header || !toggle || !menu || toggle.dataset.ready === 'true') return () => undefined;

	toggle.dataset.ready = 'true';
	const menuItems = gsap.utils.toArray<HTMLElement>('[data-menu-link]', menu);
	const menuFooter = menu.querySelector<HTMLElement>('[data-menu-footer]');
	const focusableSelector = 'a[href], button:not([disabled])';
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let isOpen = false;
	let lastFocused: HTMLElement | null = null;
	let scrollFrame = 0;
	let menuTimeline: gsap.core.Timeline | undefined;

	const updateHeader = () => {
		header.classList.toggle('is-scrolled', window.scrollY > 24);
		scrollFrame = 0;
	};

	const onScroll = () => {
		if (scrollFrame) return;
		scrollFrame = window.requestAnimationFrame(updateHeader);
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
		menuTimeline?.kill();
		lastFocused = document.activeElement as HTMLElement | null;
		setMenuState(true);
		menu.style.visibility = 'visible';

		if (!history.state?.[MENU_STATE_KEY]) {
			history.pushState({ ...history.state, [MENU_STATE_KEY]: true }, '');
		}

		menuTimeline = gsap.timeline({
			defaults: { ease: 'power3.out' },
			onComplete: () => {
				menuTimeline = undefined;
				focusFirstLink();
			},
		});

		menuTimeline
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
			);
		if (menuFooter) {
			menuTimeline.fromTo(
				menuFooter,
				{ opacity: 0, y: 12 },
				{ opacity: 1, y: 0, duration: reducedMotion.matches ? 0 : 0.4 },
				reducedMotion.matches ? 0 : '-=0.25',
			);
		}
	};

	const closeMenu = (restoreFocus = true) => {
		if (!isOpen) return;
		menuTimeline?.kill();

		menuTimeline = gsap.timeline({
			onComplete: () => {
				menuTimeline = undefined;
				setMenuState(false);
				menu.style.visibility = 'hidden';
				gsap.set([menu, ...menuItems, ...(menuFooter ? [menuFooter] : [])], { clearProps: 'all' });
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

	const handleToggle = () => (isOpen ? requestClose() : openMenu());
	const handlePopstate = () => closeMenu(false);
	const handleResize = () => {
		if (isOpen && window.matchMedia('(min-width: 68.01rem)').matches) {
			history.replaceState({ ...history.state, [MENU_STATE_KEY]: undefined }, '');
			closeMenu(false);
		}
	};
	const anchorHandlers = [...menu.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].map((link) => {
		const handler = () => {
			history.replaceState({ ...history.state, [MENU_STATE_KEY]: undefined }, '');
			closeMenu(false);
		};
		link.addEventListener('click', handler);
		return { link, handler };
	});

	toggle.addEventListener('click', handleToggle);
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('popstate', handlePopstate);
	window.addEventListener('resize', handleResize, { passive: true });
	document.addEventListener('keydown', onKeydown);

	updateHeader();

	return () => {
		if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
		menuTimeline?.kill();
		toggle.removeEventListener('click', handleToggle);
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('popstate', handlePopstate);
		window.removeEventListener('resize', handleResize);
		document.removeEventListener('keydown', onKeydown);
		anchorHandlers.forEach(({ link, handler }) => link.removeEventListener('click', handler));
		setMenuState(false);
		menu.style.visibility = 'hidden';
		gsap.set([menu, ...menuItems, ...(menuFooter ? [menuFooter] : [])], { clearProps: 'all' });
		delete toggle.dataset.ready;
	};
}
