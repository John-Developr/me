import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import AdminAuthService from "@/lib/.services/adminAuthService";
import ExperienceService from "@/lib/.services/experienceService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { revalidateChatKnowledge } from "@/lib/.services/chatRouteHelpers";
import { experienceInputSchema } from "@/utils/admin/experienceSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

/** Create an experience entry (admins only). */
export async function POST(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const parsed = experienceInputSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    const entry = await new ExperienceService(auth.session.client).create(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin", "layout");
    revalidateChatKnowledge();

    return NextResponse.json({ message: "Entry created.", data: entry, result: true }, { status: 201 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/experiences POST");
  }
}
