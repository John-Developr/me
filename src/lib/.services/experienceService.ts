import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import supabaseServer, { Table } from "../.supabase/server";
import { ServiceError } from "./serviceError";
import { ExperienceInput } from "@/utils/admin/experienceSchema";
import { ExperienceRecord, TimelineSource } from "@/utils/types";

const COLUMNS =
  "id, entry_type, company, position, employment_type, location, start_date, end_date, " +
  "description, logo_url, created_at, updated_at";

/**
 * ExperienceService — CRUD for `public.experiences` (jobs, education, milestones).
 *
 * Admin methods take the signed-in admin's client (RLS applies; the activity
 * trigger logs each change). `getPublic` feeds the home page timeline.
 *
 * @example
 * const entries = await new ExperienceService(session.client).list();
 */
export default class ExperienceService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /** All entries, newest start first. */
  async list(): Promise<ExperienceRecord[]> {
    const { data, error } = await this.client
      .from(Table.experiences)
      .select(COLUMNS)
      .order("start_date", { ascending: false })
      .returns<ExperienceRecord[]>();

    if (error) throw this.fail("load", error);
    return data ?? [];
  }

  async getById(id: string): Promise<ExperienceRecord | null> {
    const { data, error } = await this.client
      .from(Table.experiences)
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle<ExperienceRecord>();

    if (error) throw this.fail("load", error);
    return data;
  }

  async create(input: ExperienceInput): Promise<ExperienceRecord> {
    const { data, error } = await this.client
      .from(Table.experiences)
      .insert(input)
      .select(COLUMNS)
      .single<ExperienceRecord>();

    if (error) throw this.fail("create", error);
    return data;
  }

  /** Replaces every field (the form always sends the whole entry). */
  async update(id: string, input: ExperienceInput): Promise<ExperienceRecord> {
    const { data, error } = await this.client
      .from(Table.experiences)
      .update(input)
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle<ExperienceRecord>();

    if (error) throw this.fail("update", error);
    if (!data)  throw new ServiceError("Entry not found.", 404);
    return data;
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await this.client
      .from(Table.experiences)
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw this.fail("delete", error);
    if (!data?.length) throw new ServiceError("Entry not found.", 404);
  }

  /** Timeline rows for the public home page (service role, server only). */
  static async getPublic(): Promise<TimelineSource[]> {
    const { data, error } = await supabaseServer
      .from(Table.experiences)
      .select("id, entry_type, company, position, start_date, end_date, logo_url")
      .returns<TimelineSource[]>();

    if (error) {
      console.error("[ExperienceService] getPublic failed:", error.message);
      throw new Error("Failed to load experience.");
    }

    return data ?? [];
  }

  private fail(action: string, error: PostgrestError): ServiceError {
    if (error.code === "23514") {
      if (error.message.includes("dates"))     return new ServiceError("The end can't be before the start.", 400, "end_date");
      if (error.message.includes("milestone")) return new ServiceError("A milestone has a single date.", 400, "end_date");
      return new ServiceError("One of the fields is too long or invalid.", 400);
    }
    if (error.code === "42501") return new ServiceError("You don't have permission to change experience.", 403);

    console.error(`[ExperienceService] ${action} failed:`, error.message);
    return new ServiceError(`Couldn't ${action} the entry.`, 500);
  }
}
