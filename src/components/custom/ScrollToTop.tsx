'use client'

import { useLayoutEffect } from "react";

/**
 * Scrolls the window to the top when it mounts, before paint.
 *
 * For route `loading.tsx` fallbacks: Next.js doesn't reset the scroll when a
 * navigation shows a loading fallback first (e.g. opening a post from far down
 * /blog kept the old position), so the fallback does it itself.
 */
export default function ScrollToTop() {
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return null;
}
