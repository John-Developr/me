'use client'

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { networkDefine } from "@/config/networkDefine";

/**
 * Sends one page view per public route change to the first-party collector.
 * No cookies or storage are used. The external referrer is sent only with
 * the first page of a visit.
 */
export default function PageViewTracker() {
    const pathname    = usePathname();
    const lastPath    = useRef<string | null>(null);
    const sentFirst   = useRef<boolean>(false);

    useEffect(() => {
        if (!pathname || pathname === lastPath.current || pathname.startsWith("/admin")) return;
        lastPath.current = pathname;

        const payload = JSON.stringify({
            path:     pathname,
            referrer: sentFirst.current ? null : document.referrer || null,
        });
        sentFirst.current = true;

        try {
            const sent = navigator.sendBeacon?.(networkDefine.PAGE_VIEW_API, payload);
            if (!sent) {
                fetch(networkDefine.PAGE_VIEW_API, { method: "POST", body: payload, keepalive: true }).catch(() => {});
            }
        } catch {
            // Analytics must never break the page.
        }
    }, [pathname]);

    return null;
}
