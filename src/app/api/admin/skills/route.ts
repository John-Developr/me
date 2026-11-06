import { NextResponse } from "next/server";

import AdminAuthService from "@/lib/.services/adminAuthService";
import SkillService from "@/lib/.services/skillService";
import { revalidateSkillPages } from "@/lib/.services/skillRouteHelpers";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { skillInputSchema } from "@/utils/admin/skillSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

/** Create a skill (admins only). */
export async function POST(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const parsed = skillInputSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ message: "Please fix the highlighted fields.", errors: toFieldErrors(parsed.error), result: false }, { status: 400 });
    }

    const skill = await new SkillService(auth.session.client).createSkill(parsed.data);
    revalidateSkillPages();
    return NextResponse.json({ message: "Skill added.", data: skill, result: true }, { status: 201 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/skills POST");
  }
}
