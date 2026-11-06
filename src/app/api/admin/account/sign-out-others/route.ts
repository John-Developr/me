import { NextResponse } from "next/server";

import AdminAuthService from "@/lib/.services/adminAuthService";
import AccountService from "@/lib/.services/accountService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";

export const dynamic = "force-dynamic";

/** End every session except the current one. */
export async function POST() {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    await new AccountService(auth.session.client).signOutOthers();

    return NextResponse.json({ message: "Signed out of all other devices.", result: true }, { status: 200 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/account/sign-out-others POST");
  }
}
