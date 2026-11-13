import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import { Table } from "../.supabase/server";
import { ServiceError } from "./serviceError";
import { toSearchTerm } from "@/utils/admin/searchTerm";
import type { AdminSearchResult } from "@/utils/types";

/** Hits per content type; the topbar shows a short list, not a results page. */
const PER_KIND = 5;

// ============================================================
// SERVICE
// ============================================================

/**
 * AdminSearchService — the topbar search across admin content.
 *
 * Takes the **signed-in admin's** client, so RLS applies. Each content
 * type is a small case-insensitive `ilike` query (run in parallel) on the
 * columns an admin would type: titles, names, companies, senders, file names.
 *
 * @example
 * const results = await new AdminSearchService(session.client).search("next");
 */
export default class AdminSearchService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /** Content matching `query`, grouped in a fixed order (projects first). */
  async search(query: string): Promise<AdminSearchResult[]> {
    const term = toSearchTerm(query);
    if (!term) return [];

    const like = `%${term}%`;

    const [projects, blogs, experiences, skills, messages, media] = await Promise.all([
      this.client
        .from(Table.projects)
        .select("id, title, status")
        .or(`title.ilike.${like},organization.ilike.${like}`)
        .order("updated_at", { ascending: false })
        .limit(PER_KIND)
        .returns<{ id: string; title: string; status: string }[]>(),
      this.client
        .from(Table.aiBlog)
        .select("id, title, status")
        .ilike("title", like)
        .order("generated_at", { ascending: false })
        .limit(PER_KIND)
        .returns<{ id: number; title: string; status: string }[]>(),
      this.client
        .from(Table.experiences)
        .select("id, company, position")
        .or(`company.ilike.${like},position.ilike.${like}`)
        .order("start_date", { ascending: false })
        .limit(PER_KIND)
        .returns<{ id: string; company: string; position: string }[]>(),
      this.client
        .from(Table.skills)
        .select("id, name")
        .ilike("name", like)
        .order("name")
        .limit(PER_KIND)
        .returns<{ id: string; name: string }[]>(),
      this.client
        .from(Table.contactMessages)
        .select("id, first_name, last_name, email, subject")
        .or(`subject.ilike.${like},email.ilike.${like},first_name.ilike.${like},last_name.ilike.${like}`)
        .order("created_at", { ascending: false })
        .limit(PER_KIND)
        .returns<{ id: string; first_name: string | null; last_name: string | null; email: string; subject: string }[]>(),
      this.client
        .from(Table.mediaAssets)
        .select("id, file_name, alt_text")
        .or(`file_name.ilike.${like},alt_text.ilike.${like}`)
        .order("created_at", { ascending: false })
        .limit(PER_KIND)
        .returns<{ id: string; file_name: string; alt_text: string | null }[]>(),
    ]);

    for (const { error } of [projects, blogs, experiences, skills, messages, media]) {
      if (error) throw this.fail(error);
    }

    return [
      ...(projects.data ?? []).map((p): AdminSearchResult => ({
        kind: "project", id: p.id, title: p.title, hint: p.status === "published" ? "Published" : "Draft",
        href: `/admin/projects/${p.id}/edit`,
      })),
      ...(blogs.data ?? []).map((b): AdminSearchResult => ({
        kind: "blog", id: String(b.id), title: b.title, hint: b.status === "published" ? "Published" : "Draft",
        href: `/admin/blog/${b.id}/edit`,
      })),
      ...(experiences.data ?? []).map((e): AdminSearchResult => ({
        kind: "experience", id: e.id, title: e.position, hint: e.company,
        href: `/admin/experience/${e.id}/edit`,
      })),
      ...(skills.data ?? []).map((s): AdminSearchResult => ({
        kind: "skill", id: s.id, title: s.name, hint: null,
        href: "/admin/skills",
      })),
      ...(messages.data ?? []).map((m): AdminSearchResult => ({
        kind: "message", id: m.id, title: m.subject,
        hint: [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email,
        href: `/admin/messages/${m.id}`,
      })),
      ...(media.data ?? []).map((a): AdminSearchResult => ({
        kind: "media", id: a.id, title: a.file_name, hint: a.alt_text,
        href: "/admin/media",
      })),
    ];
  }

  private fail(error: PostgrestError): ServiceError {
    if (error.code === "42501") return new ServiceError("You don't have permission to search the admin.", 403);

    console.error("[AdminSearchService] search failed:", error.message);
    return new ServiceError("Couldn't search right now.", 500);
  }
}
