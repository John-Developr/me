'use client'

import { AdminIcons } from "@/components/icons/admin";
import { useDashboardRefresh } from "./DashboardRefresh";
import styles from "@/styles/pages/admin.module.css";

interface ErrorStateProps {
    message: string;
    /** Custom retry; defaults to refreshing the whole dashboard. */
    onRetry?: () => void;
}

/** Inline error with a retry button. Never replaced with placeholder data. */
export default function ErrorState({ message, onRetry }: ErrorStateProps) {
    const { refresh, isRefreshing } = useDashboardRefresh();

    return (
        <div className={styles.error} role="alert">
            <AdminIcons.AlertCircle width={18} height={18} />
            <p>{message}</p>
            <button
                type="button"
                className={styles["btn-ghost"]}
                disabled={isRefreshing}
                onClick={onRetry ?? refresh}>
                <AdminIcons.Refresh width={14} height={14} />
                {isRefreshing ? "Retrying…" : "Retry"}
            </button>
        </div>
    );
}
