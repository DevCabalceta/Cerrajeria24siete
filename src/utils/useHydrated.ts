import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * `false` while rendering on the server and during hydration, `true` after.
 * Lets an island render client-only state without a hydration mismatch and
 * without a setState-in-effect round trip.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
