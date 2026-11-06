import { SupabaseClient } from "@supabase/supabase-js";

import { Table } from "../.supabase/server";
import { ActivityLog, ContentStats, ProfileRecord } from "@/utils/types";

/** Window for the "+N in the last 30 days" figures. */
const RECENT_DAYS = 30;

type CountFilter = { column: string; value: string };

/** "Work Experience" counts jobs only (not education or milestones). */
const WORK_ONLY: CountFilter = { column: "entry_type", value: "work" };

/**
 * DashboardService — read-only queries behind the admin overview.
 *
 * Takes the **signed-in admin's** Supabase client (see AdminAuthService),
 * so every query runs under Row Level Security. Nothing here falls back
 * to sample data: failures throw, and callers render an error state.
 *
 * @example
 * const service = new DashboardService(session.client);
 * const stats   = await service.getContentStats();
 */
export default class DashboardService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /** Counts for the stat cards and the content overview. */
  async getContentStats(): Promise<ContentStats> {
    const since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const [
      totalProjects, publishedProjects, draftProjects, experiences, skills, newMessages,
      recentProjects, recentExperiences, recentSkills, recentMessages,
      lastContentUpdate,
    ] = await Promise.all([
      this.count(Table.projects),
      this.count(Table.projects, { column: "status", value: "published" }),
      this.count(Table.projects, { column: "status", value: "draft" }),
      this.count(Table.experiences, WORK_ONLY),
      this.count(Table.skills),
      this.count(Table.contactMessages, { column: "status", value: "new" }),
      this.count(Table.projects,        undefined, since),
      this.count(Table.experiences,     WORK_ONLY, since),
      this.count(Table.skills,          undefined, since),
      this.count(Table.contactMessages, undefined, since),
      this.getLastContentUpdate(),
    ]);

    return {
      totalProjects,
      publishedProjects,
      draftProjects,
      experiences,
      skills,
      newMessages,
      recent: {
        projects:    recentProjects,
        experiences: recentExperiences,
        skills:      recentSkills,
        messages:    recentMessages,
      },
      lastContentUpdate,
    };
  }

  /** Unread contact messages (for the notification bell). */
  async countNewMessages(): Promise<number> {
    return this.count(Table.contactMessages, { column: "status", value: "new" });
  }

  /** Latest activity log entries, newest first. */
  async getRecentActivity(limit = 8): Promise<ActivityLog[]> {
    const { data, error } = await this.client
      .from(Table.activityLogs)
      .select("id, user_id, action, entity_type, entity_id, description, created_at")
      .order("created_at", { ascending: false })
      .limit(limit)
      .returns<ActivityLog[]>();

    if (error) throw this.fail("recent activity", error.message);

    return data ?? [];
  }

  /** The owner profile (oldest row if several exist), or null when none exists. */
  async getProfile(): Promise<ProfileRecord | null> {
    const { data, error } = await this.client
      .from(Table.profiles)
      .select("full_name, headline, bio, avatar_url, email, location, resume_url, github_url, linkedin_url, updated_at")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<ProfileRecord>();

    if (error) throw this.fail("profile", error.message);

    return data;
  }

  /**
   * Exact row count via a HEAD request (no rows transferred).
   *
   * @param since - Only rows with created_at at or after this ISO timestamp
   */
  private async count(table: string, filter?: CountFilter, since?: string): Promise<number> {
    let query = this.client.from(table).select("id", { count: "exact", head: true });

    if (filter) query = query.eq(filter.column, filter.value);
    if (since)  query = query.gte("created_at", since);

    const { count, error } = await query;

    if (error) throw this.fail(table, error.message);

    return count ?? 0;
  }

  /**
   * Most recent change to portfolio content: the newest updated_at across the
   * content tables, or a newer content entry in the activity log (which also
   * covers deletions). Contact messages are not content.
   */
  private async getLastContentUpdate(): Promise<string | null> {
    const contentTables = [Table.profiles, Table.projects, Table.experiences, Table.skills, Table.skillCategories];

    const latest = await Promise.all([
      ...contentTables.map((table) => this.latest(table, "updated_at")),
      this.latest(Table.activityLogs, "created_at", { column: "entity_type", value: "contact_message" }),
    ]);

    const timestamps = latest.filter((t): t is string => t !== null);

    return timestamps.length
      ? timestamps.reduce((a, b) => (Date.parse(a) > Date.parse(b) ? a : b))
      : null;
  }

  /** Newest value of a timestamp column, optionally excluding rows where column = value. */
  private async latest(table: string, column: string, exclude?: CountFilter): Promise<string | null> {
    let query = this.client.from(table).select(column);

    if (exclude) query = query.neq(exclude.column, exclude.value);

    const { data, error } = await query
      .order(column, { ascending: false })
      .limit(1)
      .maybeSingle<Record<string, string>>();

    if (error) throw this.fail(table, error.message);

    return data?.[column] ?? null;
  }

  private fail(what: string, detail: string): Error {
    console.error(`[DashboardService] ${what} query failed:`, detail);
    return new Error(`Failed to load ${what}.`);
  }
}
