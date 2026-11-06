'use client'

import { formatDateTime, formatRelative } from "@/utils/admin/format";

/**
 * Relative time ("3 hours ago") with the exact local time on hover.
 * Server and client clocks/time zones can differ by a little, hence
 * suppressHydrationWarning on this one element.
 */
export default function TimeAgo({ iso }: { iso: string }) {
    return (
        <time dateTime={iso} title={formatDateTime(iso)} suppressHydrationWarning>
            {formatRelative(iso)}
        </time>
    );
}
