import { NextResponse } from "next/server";

import AdminAuthService from "@/lib/.services/adminAuthService";
import AnalyticsService from "@/lib/.services/analyticsService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { parseRangeParams } from "@/utils/admin/dateRange";

export const dynamic = "force-dynamic";

/**
 * Portfolio traffic for the dashboard chart (admins only).
 *
 * Query: `?range=7d|30d|90d` or `?from=YYYY-MM-DD&to=YYYY-MM-DD`.
 * Returns `{ available: false, reason }` when analytics is turned off.
 */
export async function GET(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const params = new URL(req.url).searchParams;
    const parsed = parseRangeParams({
      range: params.get("range"),
      from:  params.get("from"),
      to:    params.get("to"),
    });

    if (!parsed.ok) {
      return NextResponse.json({ message: parsed.error, result: false }, { status: 400 });
    }

    const traffic = await new AnalyticsService(auth.session.client).getTraffic(parsed.range);

    return NextResponse.json(
      { result: true, data: traffic },
      { status: 200, headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/analytics/traffic GET", "Couldn't load traffic data.");
  }
}
