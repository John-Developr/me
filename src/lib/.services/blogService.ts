import { SupabaseClient } from "@supabase/supabase-js";
import supabaseServer from "../.supabase/server";

import { AIBlogResponse } from "@/utils/types";
import ChatService from "./chatService";

export default class BlogService {
    private table: string = "ai_blogs";
    private server: SupabaseClient;

    constructor() {
        this.server = supabaseServer;
    }

    async index(instruction: string): Promise<boolean> {
        const chat: ChatService = new ChatService(instruction);
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
        let selectQuery = "*";
        let range = {
            from: 0,
            to: 9,
        };

        const { data, error } = await this.server
            .from(this.table)
            .select<string, AIBlogResponse>(selectQuery)
            .order("generated_at", { ascending: false })
            .range(range.from, range.to);

        if (error) {
            console.error(error);
            throw new Error("Failed to fetch blogs.");
        }

        return data ?? [];  
    }
}
