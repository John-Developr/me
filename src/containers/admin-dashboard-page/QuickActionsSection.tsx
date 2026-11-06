'use client'

import Link from "next/link";

import DashboardCard from "@/components/admin/DashboardCard";
import { notifyComingSoon } from "@/components/admin/adminNav";
import { AdminIcons, AdminIconComponent } from "@/components/icons/admin";
import { BASE_URL } from "@/config/siteUrl";
import styles from "@/styles/pages/adminDashboard.module.css";

interface QuickAction {
    label:       string;
    description: string;
    icon:        AdminIconComponent;
    /** Admin route (same tab) or external URL (new tab); without either the module isn't built yet. */
    href?:       string;
    external?:   boolean;
}

const ACTIONS: QuickAction[] = [
    { label: "Create Project",        description: "Add a new portfolio project", icon: AdminIcons.Plus, href: "/admin/projects/new" },
    { label: "Edit Profile",          description: "Name, bio, links and resume", icon: AdminIcons.Pencil, href: "/admin/profile" },
    { label: "Add Work Experience",   description: "Record a role or company",    icon: AdminIcons.Briefcase, href: "/admin/experience/new" },
    { label: "Manage Skills",         description: "Skills and categories",       icon: AdminIcons.Code, href: "/admin/skills" },
    { label: "View Public Portfolio", description: "Opens the live site",         icon: AdminIcons.ExternalLink, href: BASE_URL, external: true },
];

export default function QuickActionsSection() {
    return (
        <DashboardCard title="Quick Actions" icon={AdminIcons.Zap}>
            <ul className={styles.actions}>
                {ACTIONS.map(({ label, description, icon: Icon, href, external }) => {
                    const body = (
                        <>
                            <span className={styles["action-icon"]}><Icon width={16} height={16} /></span>
                            <span className={styles["action-text"]}>
                                <strong>{label}</strong>
                                <small>{description}</small>
                            </span>
                            {!href && <span className={styles["soon-pill"]}>Soon</span>}
                        </>
                    );

                    return (
                        <li key={label}>
                            {href && external ? (
                                <a href={href} target="_blank" rel="noopener noreferrer" className={styles.action}>{body}</a>
                            ) : href ? (
                                <Link href={href} className={styles.action}>{body}</Link>
                            ) : (
                                <button type="button" className={styles.action} aria-disabled="true" onClick={() => notifyComingSoon(label)}>
                                    {body}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </DashboardCard>
    );
}
