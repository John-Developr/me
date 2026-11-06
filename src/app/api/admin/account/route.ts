import { NextResponse } from "next/server";

import AdminAuthService from "@/lib/.services/adminAuthService";
import AccountService from "@/lib/.services/accountService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { displayNameSchema } from "@/utils/admin/accountSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

/** Update the signed-in admin's display name. Body: `{ displayName }`. */
export async function PATCH(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const parsed = displayNameSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted field.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    await new AccountService(auth.session.client).updateDisplayName(parsed.data.displayName);

    return NextResponse.json({ message: "Name updated.", result: true }, { status: 200 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/account PATCH");
  }
}
