import { NextResponse } from "next/server";

import AdminAuthService from "@/lib/.services/adminAuthService";
import AccountService from "@/lib/.services/accountService";
import RateLimitService from "@/lib/.services/rateLimitService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { passwordChangeSchema } from "@/utils/admin/accountSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

/**
 * Change the signed-in admin's password (current password required).
 * Rate limited, so the current-password check can't be brute-forced.
 */
export async function POST(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    if (!(await new RateLimitService().isAllowed("adminPassword", req))) {
      return NextResponse.json(
        { message: "Too many attempts. Please wait 15 minutes and try again.", result: false },
        { status: 429 }
      );
    }

    const parsed = passwordChangeSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, signOutOthers } = parsed.data;
    const service = new AccountService(auth.session.client);

    await service.changePassword(auth.session.admin.email, currentPassword, newPassword);
    if (signOutOthers) await service.signOutOthers();

    return NextResponse.json(
      { message: signOutOthers ? "Password changed. Other devices were signed out." : "Password changed.", result: true },
      { status: 200 }
    );
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/account/password POST");
  }
}
