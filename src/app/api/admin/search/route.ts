import { NextResponse } from "next/server";

import AdminAuthService from "@/lib/.services/adminAuthService";
import AdminSearchService from "@/lib/.services/adminSearchService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { SEARCH_MAX_LENGTH } from "@/utils/admin/searchTerm";

export const dynamic = "force-dynamic";

/**
 * Topbar search across admin content (admins only).
 *
 * Query: `?q=<text>` (2+ characters; longer input is cut to 80).
 * Returns up to 5 hits per content type as `AdminSearchResult[]`.
 */
export async function GET(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const query   = (new URL(req.url).searchParams.get("q") ?? "").slice(0, SEARCH_MAX_LENGTH);
    const results = await new AdminSearchService(auth.session.client).search(query);

    return NextResponse.json(
      { result: true, message: "OK", data: results },
      { status: 200, headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/search GET", "Couldn't search right now.");
  }
}
