import { NextResponse } from "next/server";
import { z } from "zod";

import AdminAuthService from "@/lib/.services/adminAuthService";
import SkillService from "@/lib/.services/skillService";
import { revalidateSkillPages } from "@/lib/.services/skillRouteHelpers";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { categoryInputSchema } from "@/utils/admin/skillSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };
const notFound = () => NextResponse.json({ message: "Category not found.", result: false }, { status: 404 });

/** Replace a category (the dialog sends every field). */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!z.uuid().safeParse(id).success) return notFound();

    const parsed = categoryInputSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ message: "Please fix the highlighted fields.", errors: toFieldErrors(parsed.error), result: false }, { status: 400 });
    }

    const category = await new SkillService(auth.session.client).updateCategory(id, parsed.data);
    revalidateSkillPages();
    return NextResponse.json({ message: "Category saved.", data: category, result: true });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/skill-categories/:id PATCH");
  }
}

/** Delete a category. `?keepSkills=1` keeps its skills (uncategorized); otherwise they're deleted too. */
export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!z.uuid().safeParse(id).success) return notFound();

    const keepSkills = new URL(req.url).searchParams.get("keepSkills") === "1";
    await new SkillService(auth.session.client).deleteCategory(id, keepSkills);
    revalidateSkillPages();
    return NextResponse.json({ message: "Category deleted.", result: true });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/skill-categories/:id DELETE");
  }
}
