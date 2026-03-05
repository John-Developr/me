import { useState, useCallback, useEffect } from 'react';

/**
 * `useMediaQuery` — reactively tracks whether the viewport width is at or
 * below a given breakpoint.
 *
 * Subscribes to a `MediaQueryList` so the returned value updates automatically
 * whenever the window is resized across the breakpoint — no polling required.
 *
 * ### How it works
 * ```
 * mount
 *  └─ window.matchMedia(`(max-width: ${width}px)`)
 *      ├─ reads .matches immediately   → sets initial state
 *      └─ addEventListener("change")   → updates state on resize
 *
 * unmount / width change
 *  └─ removeEventListener("change")   → cleans up listener
 * ```
 *
 * ### Usage
 * ```tsx
 * // Returns true when viewport ≤ 768 px
 * const isMobile = useMediaQuery(768);
 *
 * // Returns true when viewport ≤ 1024 px
 * const isTablet = useMediaQuery(1024);
 *
 * return isMobile ? <MobileNav /> : <DesktopNav />;
 * ```
 *
 * @param width - The maximum viewport width in pixels that defines the breakpoint.
 *                Common values: `480` (mobile), `768` (tablet), `1024` (desktop).
 *
 * @returns `true` while the viewport width is ≤ `width`px, `false` otherwise.
 *
 * @remarks
 * - Safe to call with multiple breakpoints in the same component — each
 *   invocation creates an independent `MediaQueryList` subscription.
 * - If `width` changes between renders the old listener is removed and a new
 *   one is registered automatically via the `useEffect` dependency array.
 * - **SSR**: `window` is not available in server environments. Guard with a
 *   client-only boundary (`"use client"`) or check `typeof window !== "undefined"`
 *   before use.
 */
const useMediaQuery = (width: number): boolean => {
  const [targetReached, setTargetReached] = useState(false);

  /**
   * Syncs state with the latest `MediaQueryListEvent`.
   * Memoised so the `addEventListener` / `removeEventListener` pair always
   * receives the same function reference, preventing stale listener leaks.
   */
  const updateTarget = useCallback((event: MediaQueryListEvent) => {
    setTargetReached(event.matches);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${width}px)`);

    // Sync immediately — the "change" event only fires on transitions, so
    // without this the initial render would always start as `false`.
    setTargetReached(mediaQuery.matches);

    mediaQuery.addEventListener('change', updateTarget);

    // Removes the listener when the component unmounts or `width` changes,
    // preventing memory leaks and duplicate handlers.
    return () => {
      mediaQuery.removeEventListener('change', updateTarget);
    };
  }, [width, updateTarget]);

  return targetReached;
};

export default useMediaQuery;