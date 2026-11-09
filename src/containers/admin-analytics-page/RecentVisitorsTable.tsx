import DashboardCard from "@/components/admin/DashboardCard";
import EmptyState from "@/components/admin/EmptyState";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { flagEmoji } from "@/utils/analytics";
import { RecentVisitor } from "@/utils/types";
import styles from "@/styles/pages/adminAnalytics.module.css";

import { countryName } from "./labels";

/** "4m 12s" between first and last page view; "—" for a single page. */
function duration(v: RecentVisitor): string {
    const seconds = Math.round((Date.parse(v.last_seen) - Date.parse(v.first_seen)) / 1000);
    if (v.page_views < 2 || seconds < 1) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m ? `${m}m ${s}s` : `${s}s`;
}

const titleCase = (v: string | null) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : null);

/** Latest visitors: one row per visitor per day. No identifiers are shown or stored. */
export default function RecentVisitorsTable({ visitors }: { visitors: RecentVisitor[] }) {
    return (
        <DashboardCard
            title="Recent visitors"
            icon={AdminIcons.User}
            subtitle="One row per visitor per day, newest first. Anonymous: no IP addresses or cookies.">
            {visitors.length === 0 ? (
                <EmptyState icon={AdminIcons.User} title="No visitors yet" description="Visits to the live site appear here (not local development, bots or your own signed-in visits)." />
            ) : (
                <div className={styles["table-wrap"]}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">Last seen</th>
                                <th scope="col">Location</th>
                                <th scope="col">Device</th>
                                <th scope="col">Source</th>
                                <th scope="col">Pages</th>
                                <th scope="col" className={styles.num}>Time on site</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitors.map((v) => {
                                const place = [v.city, v.country ? countryName(v.country) : null].filter(Boolean).join(", ");
                                return (
                                    <tr key={`${v.day}-${v.first_seen}`}>
                                        <td data-label="Last seen"><TimeAgo iso={v.last_seen} /></td>
                                        <td data-label="Location">
                                            <span className={styles.place}>
                                                <span aria-hidden="true">{flagEmoji(v.country)}</span>
                                                {place || <span className={styles.muted}>Unknown</span>}
                                            </span>
                                        </td>
                                        <td data-label="Device">
                                            {v.device || v.browser || v.os
                                                ? <>{titleCase(v.device)}<small className={styles.sub}>{[v.browser, v.os].filter(Boolean).join(" · ")}</small></>
                                                : <span className={styles.muted}>Unknown</span>}
                                        </td>
                                        <td data-label="Source">{v.referrer_host ?? <span className={styles.muted}>Direct</span>}</td>
                                        <td data-label="Pages">
                                            <details className={styles.paths}>
                                                <summary>{v.page_views} page{v.page_views === 1 ? "" : "s"}</summary>
                                                <ol>{v.paths.map((p, i) => <li key={i}>{p}</li>)}</ol>
                                            </details>
                                        </td>
                                        <td data-label="Time on site" className={styles.num}>{duration(v)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardCard>
    );
}
