import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import AdminAuthService from "@/lib/.services/adminAuthService";
import ExperienceService from "@/lib/.services/experienceService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { experienceInputSchema } from "@/utils/admin/experienceSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const idSchema = z.uuid();
const notFound = () => NextResponse.json({ message: "Entry not found.", result: false }, { status: 404 });

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

/** Replace an entry (the form sends every field). */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!idSchema.safeParse(id).success) return notFound();

    const parsed = experienceInputSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    const entry = await new ExperienceService(auth.session.client).update(id, parsed.data);
    revalidate();

    return NextResponse.json({ message: "Entry saved.", data: entry, result: true }, { status: 200 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/experiences/:id PATCH");
  }
}

/** Permanently delete an entry. */
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!idSchema.safeParse(id).success) return notFound();

    await new ExperienceService(auth.session.client).remove(id);
    revalidate();

    return NextResponse.json({ message: "Entry deleted.", result: true }, { status: 200 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/experiences/:id DELETE");
  }
}
