import { cache } from "react";

import AdminAuthService from "@/lib/.services/adminAuthService";
import AnalyticsService from "@/lib/.services/analyticsService";
import DashboardService from "@/lib/.services/dashboardService";

import { getProfileCompletion } from "@/utils/admin/profileCompletion";
import { presetToRange } from "@/utils/admin/dateRange";
import { ActivityLog, ContentStats, DashboardResult, ProfileCompletion, TrafficResult } from "@/utils/types";

/* ============================================================
   DASHBOARD DATA (server only)
   ------------------------------------------------------------
   Each loader is memoized per request with React `cache`, so
   sections that share data (stat cards + content overview)
   trigger one query set. Loaders never throw: a failure becomes
   `{ ok: false }` and only that section shows an error.
   ============================================================ */

/** The signed-in admin's Supabase client (RLS applies). */
async function getDashboardService(): Promise<DashboardService> {
  const session = await AdminAuthService.getSession();
  if (session.status !== "admin") throw new Error("Not authorized.");
  return new DashboardService(session.client);
}

async function settle<T>(load: () => Promise<T>, message: string): Promise<DashboardResult<T>> {
  try {
    return { ok: true, data: await load() };
  } catch (error) {
    console.error(`[dashboard] ${message}`, error);
    return { ok: false, error: message };
  }
}

export const loadContentStats = cache((): Promise<DashboardResult<ContentStats>> =>
  settle(async () => (await getDashboardService()).getContentStats(), "Couldn't load content statistics.")
);

export const loadRecentActivity = cache((): Promise<DashboardResult<ActivityLog[]>> =>
  settle(async () => (await getDashboardService()).getRecentActivity(8), "Couldn't load recent activity.")
);

export const loadProfileCompletion = cache((): Promise<DashboardResult<ProfileCompletion>> =>
  settle(async () => getProfileCompletion(await (await getDashboardService()).getProfile()), "Couldn't load the profile.")
);

export const loadNewMessageCount = cache((): Promise<DashboardResult<number>> =>
  settle(async () => (await getDashboardService()).countNewMessages(), "Couldn't load new messages.")
);

/** Page views and visitors over the last 30 days (first-party analytics). */
export const loadPortfolioViews = cache((): Promise<DashboardResult<TrafficResult>> =>
  settle(async () => {
    const session = await AdminAuthService.getSession();
    if (session.status !== "admin") throw new Error("Not authorized.");
    return new AnalyticsService(session.client).getTraffic(presetToRange("30d"));
  }, "Couldn't load portfolio views.")
);
