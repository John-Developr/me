import { Suspense } from "react";

import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import AdminAuthService from "@/lib/.services/adminAuthService";

import WelcomeHeader from "./WelcomeHeader";
import StatsSection from "./StatsSection";
import TrafficSection from "./TrafficSection";
import ContentOverviewSection from "./ContentOverviewSection";
import ActivitySection from "./ActivitySection";
import QuickActionsSection from "./QuickActionsSection";
import { CardSkeleton, StatsSkeleton } from "./DashboardSkeletons";

import styles from "@/styles/pages/adminDashboard.module.css";

/**
 * Admin overview. A server component: database sections stream in behind
 * their own skeletons and fail independently; traffic is fetched on the
 * client because its date range is interactive.
 */
export default async function AdminDashboardPage() {
    // Already verified by the (dashboard) layout; cached, so no extra query.
    const session     = await AdminAuthService.getSession();
    const displayName = session.status === "admin" ? session.admin.displayName : null;

    return (
        <DashboardRefreshProvider>
            <div className={styles.page}>
                <WelcomeHeader displayName={displayName} />

                <Suspense fallback={<StatsSkeleton />}>
                    <StatsSection />
                </Suspense>

                {/* Rows (not two independent columns) so cards side by side share a height. */}
                <div className={styles.row}>
                    <TrafficSection />
                    <Suspense fallback={<CardSkeleton rows={6} />}>
                        <ContentOverviewSection />
                    </Suspense>
                </div>

                <div className={styles.row}>
                    <Suspense fallback={<CardSkeleton rows={5} />}>
                        <ActivitySection />
                    </Suspense>
                    <QuickActionsSection />
                </div>
            </div>
        </DashboardRefreshProvider>
    );
}
