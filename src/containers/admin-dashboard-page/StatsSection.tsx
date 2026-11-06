import StatCard from "@/components/admin/StatCard";
import ErrorState from "@/components/admin/ErrorState";
import { AdminIcons } from "@/components/icons/admin";

import { loadContentStats, loadPortfolioViews } from "./dashboardData";
import { formatNumber, percentChange } from "@/utils/admin/format";
import styles from "@/styles/pages/adminDashboard.module.css";

/** "+3 in the last 30 days" — only when something was actually added. */
const recentHint = (count: number, emptyHint: string, total: number) =>
    total === 0 ? emptyHint : count > 0 ? `+${formatNumber(count)} in the last 30 days` : "No change in the last 30 days";

export default async function StatsSection() {
    const [stats, views] = await Promise.all([loadContentStats(), loadPortfolioViews()]);

    if (!stats.ok) {
        return <div className={styles.stats}><div className={styles["stats-error"]}><ErrorState message={stats.error} /></div></div>;
    }

    const s = stats.data;

    // Portfolio views: real numbers only. No provider → a dash and the reason.
    let viewsValue: number | null = null;
    let viewsHint = "Couldn't load analytics";
    let viewsUp   = false;

    if (views.ok && views.data.available) {
        const change = percentChange(views.data.totalViews, views.data.previousViews);
        viewsValue   = views.data.totalViews;
        viewsHint    = change === null
            ? `Last 30 days · ${formatNumber(views.data.total)} visitors`
            : `${change > 0 ? "+" : ""}${change}% vs previous 30 days`;
        viewsUp      = (change ?? 0) > 0;
    } else if (views.ok) {
        viewsHint = "Analytics is turned off";
    }

    return (
        <div className={styles.stats}>
            <StatCard
                label="Total Projects"
                icon={AdminIcons.Folder}
                value={s.totalProjects}
                hint={recentHint(s.recent.projects, "No projects yet", s.totalProjects)}
                trend={s.recent.projects > 0 ? "up" : "neutral"} />
            <StatCard
                label="Published Projects"
                icon={AdminIcons.Globe}
                value={s.publishedProjects}
                hint={s.totalProjects === 0 ? "Nothing published yet" : `${formatNumber(s.draftProjects)} in draft`} />
            <StatCard
                label="Work Experience"
                icon={AdminIcons.Briefcase}
                value={s.experiences}
                hint={recentHint(s.recent.experiences, "No entries yet", s.experiences)}
                trend={s.recent.experiences > 0 ? "up" : "neutral"} />
            <StatCard
                label="Total Skills"
                icon={AdminIcons.Code}
                value={s.skills}
                hint={recentHint(s.recent.skills, "No skills yet", s.skills)}
                trend={s.recent.skills > 0 ? "up" : "neutral"} />
            <StatCard
                label="New Messages"
                icon={AdminIcons.Mail}
                value={s.newMessages}
                hint={s.recent.messages > 0 ? `${formatNumber(s.recent.messages)} received in the last 30 days` : "None in the last 30 days"} />
            <StatCard
                label="Portfolio Views"
                icon={AdminIcons.Eye}
                value={viewsValue}
                hint={viewsHint}
                trend={viewsUp ? "up" : "neutral"} />
        </div>
    );
}
