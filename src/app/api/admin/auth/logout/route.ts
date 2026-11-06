import { NextResponse } from "next/server";
import AdminAuthService from "@/lib/.services/adminAuthService";

export const dynamic = "force-dynamic";

/** Ends the admin session and clears the auth cookies. */
export async function POST() {
  try {
    await new AdminAuthService().signOut();

    return NextResponse.json({ message: "Signed out.", result: true }, { status: 200 });
  } catch (error) {
    console.error("[api/admin/auth/logout] POST failed:", error);

    return NextResponse.json(
      { message: "Something went wrong signing out.", result: false },
      { status: 500 }
    );
  }
}
