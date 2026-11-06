import DashboardCard from "@/components/admin/DashboardCard";
import EmptyState from "@/components/admin/EmptyState";
import ErrorState from "@/components/admin/ErrorState";
import { AdminIcons, AdminIconComponent } from "@/components/icons/admin";

import TimeAgo from "@/components/admin/TimeAgo";
import { loadRecentActivity } from "./dashboardData";
import { ActivityAction, ActivityEntity } from "@/utils/types";
import styles from "@/styles/pages/adminDashboard.module.css";

const ENTITY_ICONS: Record<ActivityEntity, AdminIconComponent> = {
    profile:         AdminIcons.User,
    project:         AdminIcons.Folder,
    experience:      AdminIcons.Briefcase,
    skill:           AdminIcons.Code,
    skill_category:  AdminIcons.Layers,
    contact_message: AdminIcons.Mail,
    media:           AdminIcons.Image,
};

const ACTION_LABELS: Record<ActivityAction, string> = {
    created:     "Created",
    updated:     "Updated",
    deleted:     "Deleted",
    published:   "Published",
    unpublished: "Unpublished",
    received:    "Received",
};

export default async function ActivitySection() {
    const activity = await loadRecentActivity();

    return (
        <DashboardCard
            title="Recent Activity"
            icon={AdminIcons.Activity}
            subtitle="Latest changes and messages, newest first"
            className={styles["activity-card"]}>
            {!activity.ok ? (
                <ErrorState message={activity.error} />
            ) : activity.data.length === 0 ? (
                <EmptyState
                    icon={AdminIcons.Clock}
                    title="No activity yet"
                    description="Changes to your profile, projects, experience and skills, and new contact messages, will be listed here automatically." />
            ) : (
                <ol className={styles.activity}>
                    {activity.data.map((entry) => {
                        const Icon = ENTITY_ICONS[entry.entity_type] ?? AdminIcons.Activity;
                        return (
                            <li key={entry.id}>
                                <span className={styles["activity-icon"]}><Icon width={15} height={15} /></span>
                                <div className={styles["activity-body"]}>
                                    <p>{entry.description}</p>
                                    <small>
                                        <span className={`${styles["action-badge"]} ${styles[`action-${entry.action}`] ?? ""}`}>
                                            {ACTION_LABELS[entry.action] ?? entry.action}
                                        </span>
                                        <TimeAgo iso={entry.created_at} />
                                    </small>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </DashboardCard>
    );
}
