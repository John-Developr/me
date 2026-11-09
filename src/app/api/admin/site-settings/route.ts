import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import AdminAuthService from "@/lib/.services/adminAuthService";
import SiteSettingsService from "@/lib/.services/siteSettingsService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { seoSettingsSchema } from "@/utils/admin/siteSettingsSchema";
import type { ZodError } from "zod";

export const dynamic = "force-dynamic";

/** Save SEO settings (admins only). Body: `{ settings, pages }`. */
export async function PUT(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const body   = await req.json().catch(() => null);
    const parsed = seoSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", errors: seoFieldErrors(parsed.error, body), result: false },
        { status: 400 }
      );
    }

    const data = await new SiteSettingsService(auth.session.client).update(parsed.data);

    // Titles, descriptions, icon and robots are in every page's <head>.
    revalidatePath("/", "layout");

    return NextResponse.json({ message: "Settings saved.", data, result: true });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/site-settings PUT");
  }
}

/**
 * Error keys the form understands: "site_name" for site fields,
 * "pages.<page key>.<field>" for a page (e.g. "pages.contact.title").
 */
function seoFieldErrors(error: ZodError, body: unknown): Record<string, string> {
  const pages  = (body as { pages?: { key?: string }[] } | null)?.pages ?? [];
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const [scope, a, b] = issue.path.map(String);
    const key = scope === "pages" ? `pages.${pages[Number(a)]?.key ?? a}.${b ?? "title"}` : (a ?? scope);
    if (!errors[key]) errors[key] = issue.message;
  }

  return errors;
}
