import { cache } from "react";
import { NextResponse } from "next/server";
import { SupabaseClient, User } from "@supabase/supabase-js";

import { createAuthClient } from "../.supabase/authClient";
import { RPC, Table } from "../.supabase/server";
import { AdminUser } from "@/utils/types";

// ============================================================
// TYPES
// ============================================================

/** Outcome of checking the current request's user. */
export type AdminSession =
  | { status: "admin";      admin: AdminUser; client: SupabaseClient }
  | { status: "signed-out" }
  | { status: "forbidden" }                       // signed in, but not in admin_users
  | { status: "error";      message: string };    // e.g. migrations not applied

/** Result of guarding an API route: the admin session, or a ready 401/403/500 response. */
export type AdminRequestAuth =
  | { ok: true;  session: Extract<AdminSession, { status: "admin" }> }
  | { ok: false; response: NextResponse };

export interface SignInResult {
  ok:      boolean;
  status:  number;
  message: string;
}

// ============================================================
// SERVICE
// ============================================================

/**
 * AdminAuthService — Supabase Auth sign-in/out and the admin check.
 *
 * An admin is a Supabase Auth user listed in `public.admin_users`
 * (checked with the `is_admin()` RPC). The same function backs the
 * RLS policies, so the database enforces this too.
 *
 * @example
 * const session = await AdminAuthService.getSession();
 * if (session.status !== "admin") redirect("/admin/login");
 */
export default class AdminAuthService {

  /**
   * Resolves the current request's admin session. Memoized per request
   * (React `cache`), so the layout and page share one lookup.
   */
  static getSession = cache(async (): Promise<AdminSession> => {
    const client = await createAuthClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user) return { status: "signed-out" };

    const { data: isAdmin, error } = await client.rpc(RPC.isAdmin);

    if (error) {
      console.error("[AdminAuthService] is_admin check failed:", error.message);
      return {
        status:  "error",
        message: "Couldn't verify admin access. Make sure the admin database migrations have been applied.",
      };
    }

    if (isAdmin !== true) return { status: "forbidden" };

    return {
      status: "admin",
      admin:  { id: user.id, email: user.email ?? "", ...(await AdminAuthService.getIdentity(client, user)) },
      client,
    };
  });

  /**
   * Guard for admin API routes: resolves the session or returns the error response.
   *
   * @example
   * const auth = await AdminAuthService.authorizeRequest();
   * if (!auth.ok) return auth.response;
   */
  static async authorizeRequest(): Promise<AdminRequestAuth> {
    const session = await AdminAuthService.getSession();

    if (session.status === "admin") return { ok: true, session };

    const status = session.status === "signed-out" ? 401 : session.status === "forbidden" ? 403 : 500;
    return {
      ok: false,
      response: NextResponse.json({ message: "Not authorized.", result: false }, { status }),
    };
  }

  /**
   * Signs in with email + password, then requires admin access.
   * Non-admin accounts are signed straight back out.
   * Must run in a route handler (it writes the session cookies).
   */
  async signIn(email: string, password: string): Promise<SignInResult> {
    const client = await createAuthClient();
    const { error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      // Same message for unknown email and wrong password.
      return { ok: false, status: 401, message: "Invalid email or password." };
    }

    const { data: isAdmin, error: rpcError } = await client.rpc(RPC.isAdmin);

    if (rpcError || isAdmin !== true) {
      await client.auth.signOut();

      if (rpcError) {
        console.error("[AdminAuthService] is_admin check failed:", rpcError.message);
        return { ok: false, status: 500, message: "Couldn't verify admin access. Please try again later." };
      }

      return { ok: false, status: 403, message: "This account doesn't have admin access." };
    }

    return { ok: true, status: 200, message: "Signed in." };
  }

  /** Ends the session and clears the auth cookies. Route handlers only. */
  async signOut(): Promise<void> {
    const client = await createAuthClient();
    await client.auth.signOut();
  }

  /**
   * How the admin appears in the admin UI:
   * - name: the account's display name (auth metadata), else the portfolio
   *   profile's full name, else null
   * - photo: the Personal Profile photo, else null (initials are shown)
   */
  private static async getIdentity(client: SupabaseClient, user: User): Promise<{ displayName: string | null; avatarUrl: string | null }> {
    const { data } = await client
      .from(Table.profiles)
      .select("full_name, avatar_url")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<{ full_name: string | null; avatar_url: string | null }>();

    const fromMetadata = user.user_metadata?.full_name ?? user.user_metadata?.name;
    const name         = (typeof fromMetadata === "string" ? fromMetadata.trim() : "") || data?.full_name?.trim() || "";

    return { displayName: name || null, avatarUrl: data?.avatar_url?.trim() || null };
  }
}
