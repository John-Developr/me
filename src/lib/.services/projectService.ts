import { ServiceError } from "./serviceError";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import supabaseServer, { Table } from "../.supabase/server";
import { ProjectInput, ProjectPatch } from "@/utils/admin/projectSchema";
import { ProjectRecord } from "@/utils/types";

// ============================================================
// ERRORS
// ============================================================

/** Kept as a named subclass so call sites read clearly. */
export class ProjectServiceError extends ServiceError {
  constructor(message: string, status: number, field?: string) {
    super(message, status, field);
    this.name = "ProjectServiceError";
  }
}

const COLUMNS =
  "id, slug, title, tagline, description, kind, role, organization, period, highlights, tech, " +
  "logo_url, image_url, live_url, live_label, source_url, source_label, note, status, " +
  "is_featured, sort_order, published_at, created_at, updated_at";

// ============================================================
// SERVICE
// ============================================================

/**
 * ProjectService — CRUD for `public.projects`.
 *
 * Admin methods take the **signed-in admin's** client, so RLS applies and
 * the activity-log trigger records who made each change. `getPublished`
 * is the public read used by the /projects page (service role, server only).
 *
 * @example
 * const service = new ProjectService(session.client);
 * const project = await service.create(input);
 */
export default class ProjectService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /** Every project (drafts included), in display order. */
  async list(): Promise<ProjectRecord[]> {
    const { data, error } = await this.client
      .from(Table.projects)
      .select(COLUMNS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<ProjectRecord[]>();

    if (error) throw this.fail("list", error);
    return data ?? [];
  }

  /** One project, or null if the id doesn't exist. */
  async getById(id: string): Promise<ProjectRecord | null> {
    const { data, error } = await this.client
      .from(Table.projects)
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle<ProjectRecord>();

    if (error) throw this.fail("load", error);
    return data;
  }

  async create(input: ProjectInput): Promise<ProjectRecord> {
    if (input.is_featured) await this.clearFeatured();

    const { data, error } = await this.client
      .from(Table.projects)
      .insert(input)
      .select(COLUMNS)
      .single<ProjectRecord>();

    if (error) throw this.fail("create", error);
    return data;
  }

  /** Applies only the given fields (e.g. `{ status: "published" }`). */
  async update(id: string, patch: ProjectPatch): Promise<ProjectRecord> {
    if (patch.is_featured) await this.clearFeatured(id);

    const { data, error } = await this.client
      .from(Table.projects)
      .update(patch)
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle<ProjectRecord>();

    if (error) throw this.fail("update", error);
    if (!data)  throw new ProjectServiceError("Project not found.", 404);
    return data;
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await this.client
      .from(Table.projects)
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw this.fail("delete", error);
    if (!data?.length) throw new ProjectServiceError("Project not found.", 404);
  }

  /**
   * Published projects for the public /projects page, featured first.
   * Server only (service role). Throws on database errors so the page
   * can fall back to its static data.
   */
  static async getPublished(): Promise<ProjectRecord[]> {
    const { data, error } = await supabaseServer
      .from(Table.projects)
      .select(COLUMNS)
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<ProjectRecord[]>();

    if (error) {
      console.error("[ProjectService] getPublished failed:", error.message);
      throw new Error("Failed to load published projects.");
    }

    return data ?? [];
  }

  /** Only one project may be featured (unique index): unfeature the current one first. */
  private async clearFeatured(exceptId?: string): Promise<void> {
    let query = this.client.from(Table.projects).update({ is_featured: false }).eq("is_featured", true);
    if (exceptId) query = query.neq("id", exceptId);

    const { error } = await query;
    if (error) throw this.fail("update the featured project", error);
  }

  /** Maps Postgres errors to messages an admin can act on. */
  private fail(action: string, error: PostgrestError): ProjectServiceError {
    if (error.code === "23505") {
      return error.message.includes("featured")
        ? new ProjectServiceError("Another project is already featured. Try again.", 409, "is_featured")
        : new ProjectServiceError("A project with this slug already exists.", 409, "slug");
    }
    if (error.code === "23514") {
      return new ProjectServiceError("One of the fields is too long or invalid.", 400);
    }
    if (error.code === "42501") {
      return new ProjectServiceError("You don't have permission to change projects.", 403);
    }

    console.error(`[ProjectService] ${action} failed:`, error.message);
    return new ProjectServiceError(`Couldn't ${action} the project.`, 500);
  }
}
