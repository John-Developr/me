import { ServiceError } from "./serviceError";
import { AuthError, createClient, SupabaseClient } from "@supabase/supabase-js";

import { Table } from "../.supabase/server";
import { AdminAccount } from "@/utils/types";

/** Kept as a named subclass so call sites read clearly. */
export class AccountServiceError extends ServiceError {
  constructor(message: string, status: number, field?: string) {
    super(message, status, field);
    this.name = "AccountServiceError";
  }
}

/**
 * AccountService — the signed-in admin's own Supabase Auth account:
 * display name, password, and sessions.
 *
 * Takes the admin's session client (see AdminAuthService). Methods that
 * change the session write cookies, so call them from route handlers.
 *
 * @example
 * const account = await new AccountService(session.client).getAccount();
 */
export default class AccountService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async getAccount(): Promise<AdminAccount> {
    const { data: { user }, error } = await this.client.auth.getUser();
    if (error || !user) throw new AccountServiceError("Couldn't load your account.", 401);

    // RLS lets each user read only their own admin_users row.
    const { data: admin } = await this.client
      .from(Table.adminUsers)
      .select("created_at")
      .eq("user_id", user.id)
      .maybeSingle<{ created_at: string }>();

    const name = user.user_metadata?.full_name;

    return {
      id:           user.id,
      email:        user.email ?? "",
      displayName:  typeof name === "string" && name.trim() ? name.trim() : null,
      createdAt:    user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
      adminSince:   admin?.created_at ?? null,
    };
  }

  /** Stored in the auth account's metadata (`full_name`). */
  async updateDisplayName(displayName: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({ data: { full_name: displayName } });
    if (error) throw this.fail("update your name", error);
  }

  /**
   * Verifies the current password, then sets the new one.
   *
   * Verification signs in on a throwaway client (no cookies), so the
   * admin's own session is untouched; that extra session is revoked
   * right after.
   */
  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    const verifier = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
    );

    const { error: verifyError } = await verifier.auth.signInWithPassword({ email, password: currentPassword });
    if (verifyError) {
      throw new AccountServiceError("Your current password is incorrect.", 400, "currentPassword");
    }
    await verifier.auth.signOut({ scope: "local" });

    const { error } = await this.client.auth.updateUser({ password: newPassword });
    if (error) throw this.fail("change your password", error);
  }

  /** Ends every session except this one (other browsers and devices). */
  async signOutOthers(): Promise<void> {
    const { error } = await this.client.auth.signOut({ scope: "others" });
    if (error) throw this.fail("sign out other sessions", error);
  }

  private fail(action: string, error: AuthError): AccountServiceError {
    switch (error.code) {
      case "same_password":
        return new AccountServiceError("Choose a password different from your current one.", 400, "newPassword");
      case "weak_password":
        return new AccountServiceError(
          error.message || "That password is too weak for your Supabase password policy.", 400, "newPassword",
        );
      case "reauthentication_needed":
      case "reauth_nonce_missing":
        return new AccountServiceError(
          "Supabase requires email reauthentication for password changes. Turn off \"Secure password change\" " +
          "in Supabase → Authentication → Providers → Email, or reset the password from the dashboard.", 400,
        );
      case "over_request_rate_limit":
        return new AccountServiceError("Too many requests. Please wait a minute and try again.", 429);
    }

    console.error(`[AccountService] ${action} failed:`, error.code, error.message);
    return new AccountServiceError(`Couldn't ${action}. Please try again.`, 500);
  }
}
