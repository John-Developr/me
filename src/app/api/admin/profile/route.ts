import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import AdminAuthService from "@/lib/.services/adminAuthService";
import ProfileService from "@/lib/.services/profileService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { profileInputSchema } from "@/utils/admin/profileSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

/** Save the owner profile (admins only). Body: ProfileInput. */
export async function PUT(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const parsed = profileInputSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    const profile = await new ProfileService(auth.session.client).save(parsed.data);

    // Header/footer (every page) and the home page show the profile.
    revalidatePath("/", "layout");

    return NextResponse.json({ message: "Profile saved.", data: profile, result: true }, { status: 200 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/profile PUT", "Something went wrong saving the profile.");
  }
}
