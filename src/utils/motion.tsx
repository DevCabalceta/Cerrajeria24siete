import type { ComponentType } from 'react';
import { LazyMotion } from 'motion/react';

/*
 * Motion's animation features are loaded on demand instead of shipping inside
 * every island: components use the light `m.*` elements and the features arrive
 * in a separate, shared chunk right after hydration. Only islands with shared
 * layout animations (layoutId) need the larger `domMax` bundle.
 */
const loadAnimation = () => import('./motion-features').then((mod) => mod.default);
const loadLayout = () => import('./motion-features-max').then((mod) => mod.default);

/**
 * Wraps an island's root in `LazyMotion`. `strict` makes any leftover full
 * `motion.*` element throw, so the bundle can't silently grow back.
 */
export function withLazyMotion<P extends object>(Component: ComponentType<P>, features: 'animation' | 'layout' = 'animation') {
  const load = features === 'layout' ? loadLayout : loadAnimation;

  function MotionIsland(props: P) {
    return (
      <LazyMotion features={load} strict>
        <Component {...props} />
      </LazyMotion>
    );
  }
  MotionIsland.displayName = `withLazyMotion(${Component.displayName ?? Component.name})`;
  return MotionIsland;
}
