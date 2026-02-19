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

        const { error } = await this.server
            .from(this.table)
            .upsert(content, { onConflict: "slug" });

        if (error) {
            throw new Error("Failed to upsert blog content.");
        }

        return true;
    }

    async getBlogs(): Promise<AIBlogResponse[]> {
        const { data, error } = await this.server
            .from(this.table)
            .select("*")
            .order("generated_at", { ascending: false })
            .limit(2)

        if (error) {
            console.error(error);
            throw new Error("Failed to fetch blogs.");
        }

        return data ?? [];  
    }      
}
