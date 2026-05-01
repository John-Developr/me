import { SupabaseClient } from "@supabase/supabase-js";
import supabaseServer, { RPC, Table } from "../.supabase/server";

import { AIBlogResponse } from "@/utils/types";
import ChatService from "./chatService";

export default class BlogService {
    private table: string = Table.aiBlog;
    private server: SupabaseClient;

    constructor() {
        this.server = supabaseServer;
    }

    async index(path: string): Promise<boolean> {
        const chat: ChatService       = new ChatService(path);
        const content: AIBlogResponse = await chat.blogMain();

        const contentWithoutExtras = {
            title: content.title,
            slug: content.slug,
            category: content.category,
            content: content.content,
            excerpt: content.excerpt,
            tags: content.tags,
            reading: content.reading,
        };

        const { error } = await this.server
            .from(this.table)
            .upsert(contentWithoutExtras, { onConflict: "slug" });

        if (error) {
            throw new Error("Failed to upsert blog content.");
        }

        return true;
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

        const { error: updateError } = await this.server
            .from(this.table)
            .update({ views: (data.views ?? 0) + 1 })
            .eq("slug", slug);

        if (updateError) {
            console.error("Failed to increment views:", updateError);
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
