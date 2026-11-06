'use client'

import Link from "next/link";

import { useDashboardRefresh } from "@/components/admin/DashboardRefresh";
import { AdminIcons } from "@/components/icons/admin";
import { BASE_URL } from "@/config/siteUrl";
import styles from "@/styles/pages/adminDashboard.module.css";
import adminStyles from "@/styles/pages/admin.module.css";

interface WelcomeHeaderProps {
    /** Admin's name from the profile/auth account; null shows a generic greeting. */
    displayName: string | null;
}

export default function WelcomeHeader({ displayName }: WelcomeHeaderProps) {
    const { refresh, isRefreshing } = useDashboardRefresh();
    const firstName = displayName?.split(/\s+/)[0];

    return (
        <header className={styles.welcome}>
            <div>
                <h1>Welcome back{firstName ? `, ${firstName}` : ""}!</h1>
                <p>Here&apos;s what&apos;s happening with your portfolio today.</p>
            </div>

            <div className={styles["welcome-actions"]}>
                <button
                    type="button"
                    className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}
                    onClick={refresh}
                    disabled={isRefreshing}
                    aria-label="Refresh dashboard data">
                    <AdminIcons.Refresh width={15} height={15} className={isRefreshing ? adminStyles.spin : ""} />
                    <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
                </button>

                <Link href="/admin/profile" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}>
                    <AdminIcons.Pencil width={15} height={15} />
                    <span>Update Profile</span>
                </Link>

                <a href={BASE_URL} target="_blank" rel="noopener noreferrer" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}>
                    <AdminIcons.ExternalLink width={15} height={15} />
                    <span>View Portfolio</span>
                </a>

                <Link href="/admin/projects/new" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}>
                    <AdminIcons.Plus width={15} height={15} />
                    <span>Add Project</span>
                </Link>
            </div>
        </header>
    );
}
