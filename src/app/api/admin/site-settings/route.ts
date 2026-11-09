import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import AdminAuthService from "@/lib/.services/adminAuthService";
import SiteSettingsService from "@/lib/.services/siteSettingsService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { siteSettingsSchema } from "@/utils/admin/siteSettingsSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

/** Save site settings (admins only). Body: `{ favicon_url }`. */
export async function PUT(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const parsed = siteSettingsSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ message: "Please fix the highlighted field.", errors: toFieldErrors(parsed.error), result: false }, { status: 400 });
    }

    const settings = await new SiteSettingsService(auth.session.client).update(parsed.data);

    // The favicon is in every page's <head>.
    revalidatePath("/", "layout");

    return NextResponse.json({ message: "Settings saved.", data: settings, result: true });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/site-settings PUT");
  }
}
