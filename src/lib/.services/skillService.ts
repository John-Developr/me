import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import supabaseServer, { Table } from "../.supabase/server";
import { ServiceError } from "./serviceError";
import { CategoryInput, SkillInput } from "@/utils/admin/skillSchema";
import { SkillCategoryRecord, SkillRecord } from "@/utils/types";

const SKILL_COLUMNS    = "id, category_id, name, logo_url, is_core, description, core_order, is_current, sort_order, created_at, updated_at";
const CATEGORY_COLUMNS = "id, slug, name, description, icon, sort_order, created_at, updated_at";

export interface SkillsData {
  categories: SkillCategoryRecord[];
  skills:     SkillRecord[];
}

/**
 * SkillService — Skills & Technologies (`skills`, `skill_categories`).
 *
 * Admin methods take the signed-in admin's client (RLS applies; the activity
 * trigger logs changes). `getPublic` feeds /tech-stack, the home Tech Stack
 * card and tech logos site-wide (service role, server only).
 *
 * @example
 * const { categories, skills } = await new SkillService(session.client).listAll();
 */
export default class SkillService {
  constructor(private client: SupabaseClient) {}

  async listAll(): Promise<SkillsData> {
    return SkillService.read(this.client, (msg) => this.fail("load skills", msg));
  }

  // ─── Skills ──────────────────────────────────────────────

  async createSkill(input: SkillInput): Promise<SkillRecord> {
    const { data, error } = await this.client.from(Table.skills).insert(input).select(SKILL_COLUMNS).single<SkillRecord>();
    if (error) throw this.fromPostgres("save the skill", error);
    return data;
  }

  async updateSkill(id: string, input: SkillInput): Promise<SkillRecord> {
    const { data, error } = await this.client.from(Table.skills).update(input).eq("id", id).select(SKILL_COLUMNS).maybeSingle<SkillRecord>();
    if (error) throw this.fromPostgres("save the skill", error);
    if (!data)  throw new ServiceError("Skill not found.", 404);
    return data;
  }

  async deleteSkill(id: string): Promise<void> {
    const { data, error } = await this.client.from(Table.skills).delete().eq("id", id).select("id");
    if (error) throw this.fromPostgres("delete the skill", error);
    if (!data?.length) throw new ServiceError("Skill not found.", 404);
  }

  // ─── Categories ──────────────────────────────────────────

  async createCategory(input: CategoryInput): Promise<SkillCategoryRecord> {
    const { data, error } = await this.client.from(Table.skillCategories).insert(input).select(CATEGORY_COLUMNS).single<SkillCategoryRecord>();
    if (error) throw this.fromPostgres("save the category", error);
    return data;
  }

  async updateCategory(id: string, input: CategoryInput): Promise<SkillCategoryRecord> {
    const { data, error } = await this.client.from(Table.skillCategories).update(input).eq("id", id).select(CATEGORY_COLUMNS).maybeSingle<SkillCategoryRecord>();
    if (error) throw this.fromPostgres("save the category", error);
    if (!data)  throw new ServiceError("Category not found.", 404);
    return data;
  }

  /**
   * Deletes a category. Its skills are deleted too unless `keepSkills`,
   * in which case they become uncategorized (the FK sets category_id null).
   */
  async deleteCategory(id: string, keepSkills: boolean): Promise<void> {
    if (!keepSkills) {
      const { error } = await this.client.from(Table.skills).delete().eq("category_id", id);
      if (error) throw this.fromPostgres("delete the category's skills", error);
    }

    const { data, error } = await this.client.from(Table.skillCategories).delete().eq("id", id).select("id");
    if (error) throw this.fromPostgres("delete the category", error);
    if (!data?.length) throw new ServiceError("Category not found.", 404);
  }

  // ─── Public ──────────────────────────────────────────────

  /** All categories and skills for the public site. Throws on database errors. */
  static async getPublic(): Promise<SkillsData> {
    return SkillService.read(supabaseServer, (msg) => {
      console.error("[SkillService] getPublic failed:", msg);
      return new Error("Failed to load skills.");
    });
  }

  private static async read(client: SupabaseClient, onError: (message: string) => Error): Promise<SkillsData> {
    const [categories, skills] = await Promise.all([
      client.from(Table.skillCategories).select(CATEGORY_COLUMNS).order("sort_order").order("name").returns<SkillCategoryRecord[]>(),
      client.from(Table.skills).select(SKILL_COLUMNS).order("sort_order").order("name").returns<SkillRecord[]>(),
    ]);

    if (categories.error) throw onError(categories.error.message);
    if (skills.error)     throw onError(skills.error.message);

    return { categories: categories.data ?? [], skills: skills.data ?? [] };
  }

  private fail(action: string, detail: string): ServiceError {
    console.error(`[SkillService] ${action} failed:`, detail);
    return new ServiceError(`Couldn't ${action}. Please try again.`, 500);
  }

  private fromPostgres(action: string, error: PostgrestError): ServiceError {
    if (error.code === "23505") {
      return error.message.includes("slug")
        ? new ServiceError("A category with this name already exists.", 409, "name")
        : new ServiceError("This skill is already in that category.", 409, "name");
    }
    if (error.code === "23514") return new ServiceError("One of the fields is too long or invalid.", 400);
    if (error.code === "42501") return new ServiceError("You don't have permission to change skills.", 403);
    return this.fail(action, error.message);
  }
}
