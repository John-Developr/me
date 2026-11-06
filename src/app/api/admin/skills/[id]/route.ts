import { NextResponse } from "next/server";
import { z } from "zod";

import AdminAuthService from "@/lib/.services/adminAuthService";
import SkillService from "@/lib/.services/skillService";
import { revalidateSkillPages } from "@/lib/.services/skillRouteHelpers";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { skillInputSchema } from "@/utils/admin/skillSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };
const notFound = () => NextResponse.json({ message: "Skill not found.", result: false }, { status: 404 });

/** Replace a skill (the dialog sends every field). */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!z.uuid().safeParse(id).success) return notFound();

    const parsed = skillInputSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ message: "Please fix the highlighted fields.", errors: toFieldErrors(parsed.error), result: false }, { status: 400 });
    }

    const skill = await new SkillService(auth.session.client).updateSkill(id, parsed.data);
    revalidateSkillPages();
    return NextResponse.json({ message: "Skill saved.", data: skill, result: true });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/skills/:id PATCH");
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!z.uuid().safeParse(id).success) return notFound();

    await new SkillService(auth.session.client).deleteSkill(id);
    revalidateSkillPages();
    return NextResponse.json({ message: "Skill deleted.", result: true });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/skills/:id DELETE");
  }
}
