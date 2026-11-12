import { ReactNode } from "react";

import PageHeader from "@/components/admin/PageHeader";
import Skeleton from "@/components/admin/Skeleton";
import { AdminIconComponent, AdminIcons } from "@/components/icons/admin";
import { ADMIN_PAGE_HEADERS, AdminPageKey } from "@/utils/admin/pageHeaders";
import adminStyles from "@/styles/pages/admin.module.css";
import tableStyles from "@/styles/pages/adminProjects.module.css";

/* ============================================================
   LIST SKELETONS
   ------------------------------------------------------------
   Building blocks for admin loading.tsx screens. They render the
   REAL page header, card shells, toolbar and table header with
   the screens' own CSS classes, and shimmer only where data
   goes, so nothing moves when the content arrives.
   ============================================================ */

/** Placeholder the size of an admin button (38px high). */
export function ButtonSkeleton({ width = 120 }: { width?: number }) {
    return <Skeleton width={width} height={38} radius={10} />;
}

/** The screen's real title and description, with button-sized placeholders for its actions. */
export function PageHeaderSkeleton({ page, actions = [] }: { page: AdminPageKey; actions?: number[] }) {
    return (
        <PageHeader
            {...ADMIN_PAGE_HEADERS[page]}
            actions={actions.length ? <>{actions.map((w, i) => <ButtonSkeleton key={i} width={w} />)}</> : undefined} />
    );
}

type ToolbarStyles = Record<string, string>;

/**
 * Filter pills + search box, drawn with the screen's own toolbar classes
 * (Projects/Blog/Experience use adminProjects, Media/Messages adminMedia).
 */
export function ToolbarSkeleton({ filters, search, styles = tableStyles }: { filters: string[]; search: string; styles?: ToolbarStyles }) {
    return (
        <div className={styles.toolbar}>
            <div className={styles.filters}>
                {filters.map((label) => (
                    <button key={label} type="button" disabled tabIndex={-1}>
                        {label} <span className={styles.count}>·</span>
                    </button>
                ))}
            </div>
            <div className={styles.search}>
                <AdminIcons.Search width={16} height={16} />
                <input type="search" placeholder={search} disabled tabIndex={-1} aria-hidden="true" />
            </div>
        </div>
    );
}

/** Kinds of table cell placeholders. */
export type CellKind = "main" | "status" | "pill" | "text" | "num" | "actions";

export interface SkeletonColumn {
    label: string;
    cell:  CellKind;
}

const cell = (kind: CellKind, row: number): ReactNode => {
    switch (kind) {
        case "main":
            return (
                <div className={tableStyles.project}>
                    <Skeleton width={36} height={36} radius={8} />
                    <div className={`${tableStyles["project-text"]} ${adminStyles["skeleton-fill"]}`}>
                        <Skeleton width={`${62 - (row % 3) * 12}%`} height={14} />
                        <Skeleton width={`${78 - (row % 4) * 10}%`} height={11} className={adminStyles["skeleton-gap"]} />
                    </div>
                </div>
            );
        // Real status pill (border + dot) with a placeholder label.
        case "status":  return <span className={`${tableStyles.status} ${tableStyles.draft}`}><Skeleton width={52} height={10} /></span>;
        case "pill":    return <Skeleton width={78} height={22} radius={999} />;
        case "num":     return <Skeleton width={24} height={12} className={adminStyles["skeleton-end"]} />;
        case "actions": return (
            <div className={tableStyles["row-actions"]}>
                <Skeleton width={58} height={32} radius={8} />
                <Skeleton width={32} height={32} radius={8} />
            </div>
        );
        default:        return <Skeleton width={70 + (row % 3) * 14} height={12} />;
    }
};

/** The real table header with `rows` placeholder rows (same classes as the Projects/Blog/Experience tables). */
export function TableSkeleton({ columns, rows = 6 }: { columns: SkeletonColumn[]; rows?: number }) {
    return (
        <table className={tableStyles.table} aria-hidden="true">
            <thead>
                <tr>
                    {columns.map((c) => (
                        <th key={c.label} scope="col" className={c.cell === "num" ? tableStyles.num : ""}>
                            {c.cell === "actions" ? <span className={adminStyles["sr-only"]}>{c.label}</span> : c.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }, (_, r) => (
                    <tr key={r}>
                        {columns.map((c) => (
                            <td
                                key={c.label}
                                data-label={c.cell === "main" || c.cell === "actions" ? undefined : c.label}
                                className={c.cell === "num" ? tableStyles.num : c.cell === "actions" ? tableStyles["actions-cell"] : ""}>
                                {cell(c.cell, r)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/** StatCard with its real label and icon; the number and hint shimmer. */
export function StatCardSkeleton({ label, icon: Icon }: { label: string; icon: AdminIconComponent }) {
    return (
        <article className={adminStyles.stat}>
            <div className={adminStyles["stat-top"]}>
                <p className={adminStyles["stat-label"]}>{label}</p>
                <span className={adminStyles["stat-icon"]}><Icon width={16} height={16} /></span>
            </div>
            <Skeleton width={72} height={28} />
            <Skeleton width="70%" height={12} />
        </article>
    );
}

/** LineChart footprint: 260px plot (its default height) and the button row below it. */
export function ChartSkeleton({ height = 260 }: { height?: number }) {
    return (
        <div className={adminStyles.chart}>
            <Skeleton height={height} radius={10} />
            <Skeleton width={110} height={14} />
        </div>
    );
}
