'use client'

import { useSiteProfile } from "@/lib/.context/SiteProfileContext";

/** First year of the site, shown as "© 2025 – <this year>". */
const START_YEAR = 2025;

/**
 * "© 2025 – 2026 <owner name>. All rights reserved." — used by the site
 * footer and the admin sign-in page. The name comes from the site profile.
 */
export default function Copyright({ className }: { className?: string }) {
    const profile     = useSiteProfile();
    const currentYear = new Date().getFullYear();

    return (
        <p className={className}>
            © {START_YEAR} {START_YEAR !== currentYear && `– ${currentYear} `}
            {profile.name ? `${profile.name}. ` : ""}All rights reserved.
        </p>
    );
}
