import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import AdminAuthService from "@/lib/.services/adminAuthService";
import MediaService from "@/lib/.services/mediaService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * "Import site images": uploads the /public files that content points to
 * and repoints that content to the library copies. Safe to run again.
 */
export async function POST(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const result = await new MediaService(auth.session.client).importSiteImages(new URL(req.url).origin);

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin", "layout");

    return NextResponse.json({ message: "Import finished.", data: result, result: true });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/media/import POST", "Something went wrong importing images.");
  }
}
