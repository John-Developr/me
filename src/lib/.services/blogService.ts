import { SupabaseClient } from "@supabase/supabase-js";
import supabaseServer, { RPC, Table } from "../.supabase/server";

import { AIBlogResponse, NewBlogRow } from "@/utils/types";
import { getReadingTime, slugify } from "@/utils/general/stringHelpers";
import ChatService from "./chatService";

/**
 * CDN cache for blog list endpoints: served from Vercel's edge for 60s,
 * then stale copies are returned instantly while refreshing in the background.
 */
export const BLOG_LIST_CACHE_HEADERS = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=86400",
} as const;

/** Title words the instruction bans; checked in code because models ignore it at times. */
const BANNED_TITLE_PATTERN = /\b(beyond|finding|unlock\w*|unleash\w*|mastering|navigat\w*|embrac\w*)\b/i;

export default class BlogService {
    private table: string = Table.aiBlog;
    private server: SupabaseClient;

    constructor() {
        this.server = supabaseServer;
    }

    /**
     * Generates a new post and inserts it. Never overwrites an existing post:
     * a colliding slug gets a numeric suffix instead.
     *
     * @param instruction - Contents of src/docs/blog-instruction.md
     * @returns The slug the post was saved under
     */
    async index(instruction: string): Promise<string> {
        const post = await this.generate(instruction);
        const slug = await this.getUniqueSlug(post.slug);

        const { error } = await this.server
            .from(this.table)
            .insert({ ...post, slug });

        if (error) {
            console.error(error);
            throw new Error("Failed to insert blog content.");
        }

        return slug;
    }

    /**
     * Asks Gemini for a post (retrying on failures or invalid output)
     * and computes the reading time. Does not save anything.
     *
     * @param instruction - Contents of src/docs/blog-instruction.md
     */
    async generate(instruction: string): Promise<NewBlogRow> {
        const MAX_ATTEMPTS = 3;

        const recentTitles = await this.getRecentTitles(15);
        const chat         = new ChatService(instruction);
        let lastError: unknown;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                const post = await chat.blogMain(recentTitles);

                // Models drift back to cliché titles; retry, but accept on the last attempt.
                if (BANNED_TITLE_PATTERN.test(post.title) && attempt < MAX_ATTEMPTS) {
                    throw new Error(`Cliché title rejected: "${post.title}"`);
                }

                return {
                    ...post,
                    slug:    slugify(post.slug) || slugify(post.title),
                    reading: getReadingTime(post.content),
                };
            } catch (error) {
                lastError = error;
                console.error(`Blog generation attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error);

                // Back off before retrying (3s, then 6s) — Gemini overloads (503) are usually brief.
                if (attempt < MAX_ATTEMPTS) {
                    await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
                }
            }
        }

        throw lastError instanceof Error ? lastError : new Error("Blog generation failed.");
    }

    /**
     * Titles of the most recent posts, passed to the prompt so topics don't repeat.
     */
    private async getRecentTitles(limit: number): Promise<string[]> {
        const { data, error } = await this.server
            .from(this.table)
            .select("title")
            .order("generated_at", { ascending: false })
            .limit(limit);

        if (error) {
            console.error(error);
            return [];
        }

        return (data ?? []).map((row: { title: string }) => row.title);
    }

    /**
     * Returns `base` if unused, otherwise `base-2`, `base-3`, ...
     */
    private async getUniqueSlug(base: string): Promise<string> {
        const { data, error } = await this.server
            .from(this.table)
            .select("slug")
            .like("slug", `${base}%`);

        if (error) {
            console.error(error);
            throw new Error("Failed to check slug uniqueness.");
        }

        const taken = new Set((data ?? []).map((row: { slug: string }) => row.slug));
        let slug    = base;

        for (let n = 2; taken.has(slug); n++) {
            slug = `${base}-${n}`;
        }

        return slug;
    }

    /**
     * Lightweight read used by the keep-alive cron so the Supabase
     * project registers activity and is not paused for inactivity.
     */
    async ping(): Promise<number> {
        const { data, error } = await this.server
            .from(this.table)
            .select("slug")
            .limit(1);

        if (error) {
            throw new Error("Failed to ping database.");
        }

        return data?.length ?? 0;
    }

    async getBlogs(params: URLSearchParams): Promise<AIBlogResponse[]> {
        const selectQuery = "*";
        const category: string | null  = params.get("category");
        const sort: string | null       = params.get("sort") || "desc";

        let query = this.server
            .from(this.table)
            .select<string, AIBlogResponse>(selectQuery);

        if (category && category !== "All") {
            query = query.eq("category", category);
        }

        query = query.order("generated_at", { ascending: sort === "asc" });

        const { data, error } = await query;

        if (error) {
            console.error(error);
            throw new Error("Failed to fetch blogs.");
        }

        return data ?? [];
    }

    async findBySlug(slug: string): Promise<AIBlogResponse[]> {
        const { data, error } = await this.server
            .from(this.table)
            .select("*")
            .eq("slug", slug)
            .single();

        if (error) {
            console.error(error);
            throw new Error("Failed to fetch blog by slug.");
        }

        return data ?? [];
    }

    /**
     * Increments a blog's view count. Called by the API route after the
     * response is sent, so readers don't wait on this extra round trip.
     */
    async incrementViews(slug: string, currentViews: number): Promise<void> {
        const { error } = await this.server
            .from(this.table)
            .update({ views: currentViews + 1 })
            .eq("slug", slug);

        if (error) {
            console.error("Failed to increment views:", error);
        }
    }

    /**
     * Fetches one post by slug for server rendering (page, metadata, share image).
     * Does not count a view — that happens in the API route.
     *
     * @returns The post, or null if no post has this slug
     * @throws  On database errors
     */
    async getBySlug(slug: string): Promise<AIBlogResponse | null> {
        const { data, error } = await this.server
            .from(this.table)
            .select("*")
            .eq("slug", slug)
            .maybeSingle<AIBlogResponse>();

        if (error) {
            console.error(error);
            throw new Error("Failed to fetch blog by slug.");
        }

        return data;
    }

    /**
     * Slugs and dates of all posts, for sitemap.xml.
     */
    async getSitemapEntries(): Promise<Pick<AIBlogResponse, "slug" | "generated_at">[]> {
        const { data, error } = await this.server
            .from(this.table)
            .select("slug, generated_at")
            .order("generated_at", { ascending: false });

        if (error) {
            console.error(error);
            throw new Error("Failed to fetch sitemap entries.");
        }

        return data ?? [];
    }

    async getRecentBlogs(): Promise<AIBlogResponse[]> {
        const query = this.server
            .from(this.table)
            .select("*")
            .order("generated_at", { ascending: false }).limit(2);

        const { data, error } = await query;

        if (error) {
            console.error(error);
            throw new Error("Failed to fetch recent blogs.");
        }

        return data ?? [];
    }

    async getLeastInsertedCategory(): Promise<string | null> {
        const { data, error } = await this.server.rpc(RPC.getLeastInsertedCategory);

        if (error) {
            console.error(error);
            throw new Error("Failed to fetch least inserted category.");
        }

        return data ?? null;
    }
}
