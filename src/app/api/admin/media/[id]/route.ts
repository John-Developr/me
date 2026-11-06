import { NextResponse } from "next/server";
import { z } from "zod";

import AdminAuthService from "@/lib/.services/adminAuthService";
import MediaService from "@/lib/.services/mediaService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const idSchema  = z.uuid();
const altSchema = z.object({
  alt_text: z.string().trim().max(300, "Alt text must be 300 characters or fewer.").transform((v) => v || null).nullable(),
});

const notFound = () => NextResponse.json({ message: "File not found.", result: false }, { status: 404 });

/** Update a file's alt text. Body: `{ alt_text }`. */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!idSchema.safeParse(id).success) return notFound();

    const parsed = altSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the alt text.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    const asset = await new MediaService(auth.session.client).updateAlt(id, parsed.data.alt_text);
    return NextResponse.json({ message: "Saved.", data: asset, result: true });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/media/:id PATCH");
  }
}

/** Delete a file. Refused (409) while any content still uses it. */
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!idSchema.safeParse(id).success) return notFound();

    await new MediaService(auth.session.client).remove(id);
    return NextResponse.json({ message: "File deleted.", result: true });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/media/:id DELETE");
  }
}
