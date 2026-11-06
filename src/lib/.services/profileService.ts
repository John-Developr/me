import { ServiceError } from "./serviceError";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import supabaseServer, { Table } from "../.supabase/server";
import { ProfileInput } from "@/utils/admin/profileSchema";
import { PortfolioProfile } from "@/utils/types";

/** Kept as a named subclass so call sites read clearly. */
export class ProfileServiceError extends ServiceError {
  constructor(message: string, status: number) {
    super(message, status);
    this.name = "ProfileServiceError";
  }
}

const COLUMNS =
  "id, full_name, headline, bio, avatar_url, email, phone, location, resume_url, " +
  "website_url, github_url, linkedin_url, booking_url, facebook_url, instagram_url, x_url, created_at, updated_at";

/**
 * ProfileService — the single owner profile in `public.profiles`.
 *
 * Admin methods take the signed-in admin's client (RLS applies, and the
 * activity-log trigger records "Profile updated"). `getPublic` is the
 * service-role read for the public home page.
 *
 * @example
 * const profile = await new ProfileService(session.client).save(input);
 */
export default class ProfileService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /** The profile, or null if none has been created yet. */
  async get(): Promise<PortfolioProfile | null> {
    const { data, error } = await this.client
      .from(Table.profiles)
      .select(COLUMNS)
      .limit(1)
      .maybeSingle<PortfolioProfile>();

    if (error) throw this.fail("load", error);
    return data;
  }

  /** Updates the profile, or creates it on first save (one row only). */
  async save(input: ProfileInput): Promise<PortfolioProfile> {
    const existing = await this.get();

    const query = existing
      ? this.client.from(Table.profiles).update(input).eq("id", existing.id)
      : this.client.from(Table.profiles).insert(input);

    const { data, error } = await query.select(COLUMNS).single<PortfolioProfile>();

    if (error) throw this.fail("save", error);
    return data;
  }

  /**
   * Profile for the public site (service role, server only).
   * Throws on database errors so the page can fall back to its defaults.
   */
  static async getPublic(): Promise<PortfolioProfile | null> {
    const { data, error } = await supabaseServer
      .from(Table.profiles)
      .select(COLUMNS)
      .limit(1)
      .maybeSingle<PortfolioProfile>();

    if (error) {
      console.error("[ProfileService] getPublic failed:", error.message);
      throw new Error("Failed to load the profile.");
    }

    return data;
  }

  private fail(action: string, error: PostgrestError): ProfileServiceError {
    if (error.code === "23514") return new ProfileServiceError("One of the fields is too long or invalid.", 400);
    if (error.code === "42501") return new ProfileServiceError("You don't have permission to edit the profile.", 403);
    if (error.code === "23505") return new ProfileServiceError("A profile already exists. Reload the page and try again.", 409);

    console.error(`[ProfileService] ${action} failed:`, error.message);
    return new ProfileServiceError(`Couldn't ${action} the profile.`, 500);
  }
}
