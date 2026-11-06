import Link from "next/link";

import DashboardCard from "@/components/admin/DashboardCard";
import ErrorState from "@/components/admin/ErrorState";
import { AdminIcons } from "@/components/icons/admin";

import TimeAgo from "@/components/admin/TimeAgo";
import { loadContentStats, loadProfileCompletion } from "./dashboardData";
import { formatNumber } from "@/utils/admin/format";
import { PROFILE_COMPLETION_RULES } from "@/utils/admin/profileCompletion";
import styles from "@/styles/pages/adminDashboard.module.css";

export default async function ContentOverviewSection() {
    const [stats, profile] = await Promise.all([loadContentStats(), loadProfileCompletion()]);

    return (
        <DashboardCard title="Content Overview" icon={AdminIcons.FileText} subtitle="Publishing status of your portfolio">
            {!stats.ok ? (
                <ErrorState message={stats.error} />
            ) : (
                <dl className={styles.overview}>
                    <div><dt>Published projects</dt><dd>{formatNumber(stats.data.publishedProjects)}</dd></div>
                    <div><dt>Draft projects</dt><dd>{formatNumber(stats.data.draftProjects)}</dd></div>
                    <div><dt>Experience entries</dt><dd>{formatNumber(stats.data.experiences)}</dd></div>
                    <div><dt>Skills</dt><dd>{formatNumber(stats.data.skills)}</dd></div>
                    <div>
                        <dt>Last content update</dt>
                        <dd>{stats.data.lastContentUpdate ? <TimeAgo iso={stats.data.lastContentUpdate} /> : <span className={styles.muted}>Never</span>}</dd>
                    </div>
                </dl>
            )}

            <div className={styles.completion}>
                {!profile.ok ? (
                    <ErrorState message={profile.error} />
                ) : (
                    <>
                        <div className={styles["completion-head"]}>
                            <p>Profile completion</p>
                            <strong>{profile.data.percent}%</strong>
                        </div>

                        <div
                            className={styles.progress}
                            role="progressbar"
                            aria-label="Profile completion"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={profile.data.percent}>
                            <span style={{ width: `${profile.data.percent}%` }} />
                        </div>

                        {!profile.data.exists ? (
                            <p className={styles["completion-note"]}>
                                No profile saved yet. <Link href="/admin/profile">Create your profile</Link> — completion is scored on {PROFILE_COMPLETION_RULES.length} fields.
                            </p>
                        ) : profile.data.missing.length > 0 ? (
                            <details className={styles["completion-details"]}>
                                <summary>{profile.data.missing.length} field{profile.data.missing.length === 1 ? "" : "s"} missing</summary>
                                <ul>
                                    {profile.data.missing.map((label) => <li key={label}>{label}</li>)}
                                </ul>
                                <Link href="/admin/profile" className={styles["completion-link"]}>Complete your profile →</Link>
                            </details>
                        ) : (
                            <p className={styles["completion-note"]}>
                                <AdminIcons.Check width={14} height={14} /> All {PROFILE_COMPLETION_RULES.length} profile fields are filled in.
                            </p>
                        )}
                    </>
                )}
            </div>
        </DashboardCard>
    );
}
