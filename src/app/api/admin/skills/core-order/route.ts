import { NextResponse } from "next/server";

import AdminAuthService from "@/lib/.services/adminAuthService";
import SkillService from "@/lib/.services/skillService";
import { revalidateSkillPages } from "@/lib/.services/skillRouteHelpers";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { coreOrderSchema } from "@/utils/admin/skillSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

/** Save the Core Stack order (drag and drop on the Skills screen). Body: `{ ids: [...] }`, first = #1. */
export async function PUT(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const parsed = coreOrderSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ message: "Couldn't read the new order.", errors: toFieldErrors(parsed.error), result: false }, { status: 400 });
    }

    await new SkillService(auth.session.client).reorderCore(parsed.data.ids);
    revalidateSkillPages();
    return NextResponse.json({ message: "Core Stack order saved.", result: true });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/skills/core-order PUT");
  }
}
