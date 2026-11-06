import { NextResponse } from "next/server";
import { z } from "zod";

import AdminAuthService from "@/lib/.services/adminAuthService";
import RateLimitService from "@/lib/.services/rateLimitService";

export const dynamic = "force-dynamic";

const credentialsSchema = z.object({
  email:    z.email().max(254),
  password: z.string().min(1).max(200),
});

/**
 * Admin sign-in. Sets the Supabase session cookies on success.
 * Rate limited per IP; non-admin accounts are rejected and signed out.
 */
export async function POST(req: Request) {
  try {
    const limiter = new RateLimitService();

    if (!(await limiter.isAllowed("adminLogin", req))) {
      return NextResponse.json(
        { message: "Too many sign-in attempts. Please wait 15 minutes and try again.", result: false },
        { status: 429 }
      );
    }

    const parsed = credentialsSchema.safeParse(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Enter a valid email and password.", result: false },
        { status: 400 }
      );
    }

    const service = new AdminAuthService();
    const { ok, status, message } = await service.signIn(parsed.data.email, parsed.data.password);

    return NextResponse.json({ message, result: ok }, { status });
  } catch (error) {
    console.error("[api/admin/auth/login] POST failed:", error);

    return NextResponse.json(
      { message: "Something went wrong signing in.", result: false },
      { status: 500 }
    );
  }
}
