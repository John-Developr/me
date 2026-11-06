'use client'

import { createContext, ReactNode, useCallback, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface DashboardRefreshValue {
    /** Re-runs the server queries and tells client sections to refetch. */
    refresh:      () => void;
    isRefreshing: boolean;
    /** Increments on every refresh; client sections refetch when it changes. */
    refreshKey:   number;
}

const DashboardRefreshContext = createContext<DashboardRefreshValue | undefined>(undefined);

/**
 * Shared "refresh" for a dashboard page. Server-rendered sections update via
 * `router.refresh()` (kept on screen until new data arrives); client-fetched
 * sections watch `refreshKey`.
 */
export function DashboardRefreshProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [refreshKey, setRefreshKey]  = useState<number>(0);

    const refresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
        startTransition(() => router.refresh());
    }, [router]);

    return (
        <DashboardRefreshContext.Provider value={{ refresh, isRefreshing: isPending, refreshKey }}>
            {children}
        </DashboardRefreshContext.Provider>
    );
}

export const useDashboardRefresh = (): DashboardRefreshValue => {
    const context = useContext(DashboardRefreshContext);
    if (!context) throw new Error("useDashboardRefresh must be used within DashboardRefreshProvider");
    return context;
};
