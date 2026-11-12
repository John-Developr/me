import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import { ServiceError } from "./serviceError";
import { Table } from "../.supabase/server";
import { BlogInput, BlogPatch } from "@/utils/admin/blogSchema";
import { getReadingTime } from "@/utils/general/stringHelpers";
import { BlogRecord } from "@/utils/types";

const COLUMNS =
  "id, title, slug, category, content, excerpt, tags, reading, views, status, source, generated_at, updated_at";

/**
 * AdminBlogService — CRUD for blog posts (`ai_blogs`) from the admin.
 *
 * Takes the **signed-in admin's** client, so RLS applies. Public reads
 * (published posts only) stay in BlogService, which uses the service role.
 *
 * - Reading time is recomputed whenever content changes.
 * - Publishing a draft sets its date (`generated_at`) to now, so it shows
 *   up as the newest post instead of under the date it was drafted.
 *
 * @example
 * const service = new AdminBlogService(session.client);
 * const post    = await service.create(input);
 */
export default class AdminBlogService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /** Every post (drafts included), newest first. */
  async list(): Promise<BlogRecord[]> {
    const { data, error } = await this.client
      .from(Table.aiBlog)
      .select(COLUMNS)
      .order("generated_at", { ascending: false })
      .returns<BlogRecord[]>();

    if (error) throw this.fail("list", error);
    return data ?? [];
  }

  /** One post, or null if the id doesn't exist. */
  async getById(id: number): Promise<BlogRecord | null> {
    const { data, error } = await this.client
      .from(Table.aiBlog)
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle<BlogRecord>();

    if (error) throw this.fail("load", error);
    return data;
  }

  async create(input: BlogInput): Promise<BlogRecord> {
    await this.assertSlugFree(input.slug);

    const { data, error } = await this.client
      .from(Table.aiBlog)
      .insert({ ...input, reading: getReadingTime(input.content) })
      .select(COLUMNS)
      .single<BlogRecord>();

    if (error) throw this.fail("create", error);
    return data;
  }

  /** Applies only the given fields (e.g. `{ status: "published" }`). */
  async update(id: number, patch: BlogPatch): Promise<BlogRecord> {
    const current = await this.getById(id);
    if (!current) throw new ServiceError("Post not found.", 404);

    if (patch.slug && patch.slug !== current.slug) await this.assertSlugFree(patch.slug, id);

    const changes: Record<string, unknown> = { ...patch };
    if (patch.content !== undefined) changes.reading = getReadingTime(patch.content);
    if (patch.status === "published" && current.status === "draft") changes.generated_at = new Date().toISOString();

    const { data, error } = await this.client
      .from(Table.aiBlog)
      .update(changes)
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle<BlogRecord>();

    if (error) throw this.fail("update", error);
    if (!data)  throw new ServiceError("Post not found.", 404);
    return data;
  }

  /** Deletes a post. Returns its slug so the caller can revalidate its page. */
  async remove(id: number): Promise<string> {
    const { data, error } = await this.client
      .from(Table.aiBlog)
      .delete()
      .eq("id", id)
      .select("slug");

    if (error) throw this.fail("delete", error);
    if (!data?.length) throw new ServiceError("Post not found.", 404);
    return (data[0] as { slug: string }).slug;
  }

  /** Slugs must be unique: /blog/[slug] loads one post. */
  private async assertSlugFree(slug: string, exceptId?: number): Promise<void> {
    let query = this.client.from(Table.aiBlog).select("id").eq("slug", slug).limit(1);
    if (exceptId !== undefined) query = query.neq("id", exceptId);

    const { data, error } = await query;
    if (error) throw this.fail("check the slug of", error);
    if (data?.length) throw new ServiceError("A post with this slug already exists.", 409, "slug");
  }

  /** Maps Postgres errors to messages an admin can act on. */
  private fail(action: string, error: PostgrestError): ServiceError {
    if (error.code === "23505") return new ServiceError("A post with this slug already exists.", 409, "slug");
    if (error.code === "23514") return new ServiceError("One of the fields is too long or invalid.", 400);
    if (error.code === "42501") return new ServiceError("You don't have permission to change blog posts.", 403);

    console.error(`[AdminBlogService] ${action} failed:`, error.message);
    return new ServiceError(`Couldn't ${action} the post.`, 500);
  }
}
