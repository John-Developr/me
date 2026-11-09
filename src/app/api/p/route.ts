import { createHash } from "crypto";
import { after } from "next/server";
import { cookies } from "next/headers";

import AnalyticsService from "@/lib/.services/analyticsService";
import RateLimitService from "@/lib/.services/rateLimitService";
import { hasOptedOut, isLikelyBot, normalizePath, parseUserAgent, readVercelGeo, referrerHost } from "@/utils/analytics";

export const dynamic = "force-dynamic";

/** Always the same empty reply: whether a view was recorded is not revealed. */
const NO_CONTENT = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

/**
 * First-party page view collector (sent by PageViewTracker with sendBeacon).
 * Body: `{ path, referrer }`. Short, neutral path so content blockers don't
 * break the site.
 *
 * Stored per view: day, path, referrer host, country/region/city (Vercel
 * geolocation headers), device type and browser/OS family. Never the IP.
 *
 * Not recorded: bots, Do Not Track / Global Privacy Control, admin/API paths,
 * visits from a browser signed in to the admin, and local development
 * (unless ANALYTICS_DEV=1). Nothing personal is
 * stored — see supabase/migrations/20261111000100_analytics.sql.
 */
export async function POST(req: Request) {
  try {
    // Local dev shares the production database: don't mix test browsing into real stats.
    if (process.env.NODE_ENV !== "production" && process.env.ANALYTICS_DEV !== "1") return NO_CONTENT();

    const userAgent = req.headers.get("user-agent");

    if (isLikelyBot(userAgent)) return NO_CONTENT();
    if (hasOptedOut({ dnt: req.headers.get("dnt"), gpc: req.headers.get("sec-gpc") })) return NO_CONTENT();

    // The owner's own browsing (signed in to the admin) isn't traffic.
    const cookieStore = await cookies();
    if (cookieStore.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"))) return NO_CONTENT();

    // sendBeacon posts text/plain; parse it ourselves.
    const body = await req.text().then((t) => (t.length <= 2048 ? JSON.parse(t) : null)).catch(() => null);
    const path = normalizePath(body?.path);
    if (!path) return NO_CONTENT();

    if (!(await new RateLimitService().isAllowed("pageView", req))) return NO_CONTENT();

    const ip  = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const own = req.headers.get("host");

    // Hashed here, salted again (with a salt that's deleted daily) in the database.
    const visitorKey = createHash("sha256").update(`${ip}|${userAgent}|${own}`).digest("hex");
    const referrer   = referrerHost(body?.referrer, own);

    // Coarse details only: location from Vercel's headers, browser/OS family names.
    const details = { ...readVercelGeo((name) => req.headers.get(name)), ...parseUserAgent(userAgent) };

    // Respond immediately; write after the response is sent.
    after(() => AnalyticsService.recordPageView(path, visitorKey, referrer, details));

    return NO_CONTENT();
  } catch {
    return NO_CONTENT();
  }
}
