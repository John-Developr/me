import { SupabaseClient } from "@supabase/supabase-js";

import supabaseServer, { RPC } from "../.supabase/server";
import { ServiceError } from "./serviceError";
import { TrafficPoint, TrafficRange, TrafficResult } from "@/utils/types";
import { enumerateDays, previousRange } from "@/utils/admin/dateRange";

// ============================================================
// PROVIDER CONTRACT
// ============================================================

/**
 * What an analytics integration implements. Providers return aggregate
 * daily counts only — never per-visitor data.
 */
export interface AnalyticsProvider {
  /** Display name, e.g. "First-party". */
  name: string;
  /** Daily unique visitors and page views for each day in the range. */
  getDaily(range: TrafficRange): Promise<TrafficPoint[]>;
}

/**
 * First-party analytics stored in Supabase (see
 * supabase/migrations/20261111000100_analytics.sql): no cookies, no IPs;
 * a daily-salted visitor hash. Reads go through the admin-only
 * `traffic_daily` RPC with the signed-in admin's client.
 */
class SupabaseAnalyticsProvider implements AnalyticsProvider {
  name = "First-party";

  constructor(private client: SupabaseClient) {}

  async getDaily(range: TrafficRange): Promise<TrafficPoint[]> {
    const { data, error } = await this.client.rpc(RPC.trafficDaily, { p_from: range.from, p_to: range.to });

    if (error) {
      console.error("[AnalyticsService] traffic_daily failed:", error.message);
      if (/could not find the function|does not exist/i.test(error.message)) {
        throw new ServiceError("Analytics isn't set up yet. Run supabase/migrations/20261111000100_analytics.sql.", 503);
      }
      throw new ServiceError("Couldn't load traffic data.", 500);
    }

    const rows = (data ?? []) as { day: string; visitors: number; views: number }[];

    return rows.map((row) => ({
      date:     row.day,
      visitors: Number(row.visitors),
      views:    Number(row.views),
    }));
  }
}

// ============================================================
// SERVICE
// ============================================================

/**
 * AnalyticsService — portfolio traffic for the dashboard.
 *
 * Uses first-party analytics unless ANALYTICS_DISABLED=1, in which case it
 * returns `{ available: false }` (never estimated or sample numbers).
 *
 * @example
 * const traffic = await new AnalyticsService(session.client).getTraffic(range);
 */
export default class AnalyticsService {
  private provider: AnalyticsProvider | null;

  constructor(client: SupabaseClient) {
    this.provider = process.env.ANALYTICS_DISABLED === "1" ? null : new SupabaseAnalyticsProvider(client);
  }

  /** Daily visitors and views for the range, plus the previous period's totals. */
  async getTraffic(range: TrafficRange): Promise<TrafficResult> {
    if (!this.provider) {
      return { available: false, reason: "Analytics is turned off (ANALYTICS_DISABLED=1)." };
    }

    const [current, previous] = await Promise.all([
      this.provider.getDaily(range),
      this.provider.getDaily(previousRange(range)),
    ]);

    // Align to every day in the range so gaps plot as 0 rather than being skipped.
    const byDay  = new Map(current.map((p) => [p.date, p]));
    const points = enumerateDays(range).map((date) => ({
      date,
      visitors: byDay.get(date)?.visitors ?? 0,
      views:    byDay.get(date)?.views ?? 0,
    }));

    const sum = (list: TrafficPoint[], key: "visitors" | "views") => list.reduce((total, p) => total + p[key], 0);

    return {
      available:     true,
      provider:      this.provider.name,
      range,
      points,
      total:         sum(points, "visitors"),
      totalViews:    sum(points, "views"),
      previousTotal: sum(previous, "visitors"),
      previousViews: sum(previous, "views"),
    };
  }

  /**
   * Records one page view (service role). Errors are logged, never thrown:
   * analytics must not affect visitors.
   *
   * @param visitorKey - Server-side hash of IP + user agent (salted again in the database)
   */
  static async recordPageView(path: string, visitorKey: string, referrerHost: string | null): Promise<void> {
    const { error } = await supabaseServer.rpc(RPC.recordPageView, {
      p_path:          path,
      p_visitor_key:   visitorKey,
      p_referrer_host: referrerHost,
    });

    if (error) console.error("[AnalyticsService] record_page_view failed:", error.message);
  }

  /** Deletes page views older than `keepDays` (daily keep-alive cron). */
  static async prune(keepDays = 400): Promise<void> {
    const { error } = await supabaseServer.rpc(RPC.prunePageViews, { p_keep_days: keepDays });
    if (error) console.error("[AnalyticsService] prune failed:", error.message);
  }
}
