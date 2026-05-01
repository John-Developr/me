// src/config/AssistantService.ts
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";

import { z, ZodObject, ZodRawShape } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import BlogService from "./blogService";

import { AssistantConfig, Message, role, AIBlogResponse, BlogCategoryEnum } from "@/utils/types";
import { storageKeys } from "@/config/storageKeys";

/**
 * ChatService handles interactions with the GoogleGenAI API,
 * maintains conversation history, and provides utilities for
 * blog generation.
 */

export default class ChatService {
    private AI: GoogleGenAI; // GoogleGenAI instance
    private config: AssistantConfig; // Configuration for AI chat
    private instruction: string; // System instruction for AI

    constructor(instruction: string) {
        this.instruction = instruction;

        // Initialize AI instance with API key
        this.AI = new GoogleGenAI({
            apiKey: process.env.NEXT_SECRET_GEMINI_API_KEY!,
        });

        // Default chat configuration
        this.config = {
            model: "gemini-2.5-flash",
            config: {
                responseModalities: ["text"],
                systemInstruction: this.instruction
            },
            history: [],
            contents: ""
        };
    }

    /**
     * Sends a message to the AI and returns its response.
     * Maintains conversation history and trims it to the last 10 messages.
     */
    async index(message: string): Promise<string> {
        this.config.history = await this.getChatCookie();

        // Check if adding the new message would exceed cookie size limits
        // return "limit" if it does, so the frontend can handle it (e.g., by clearing history)
        if (await this.isCookieSizeApproachingLimit()) {
          return "limit";
        }

        // Create chat session and send message
        const chat = await this.AI.chats.create(this.config);
        const reply = await chat.sendMessage({
            message: message,
        });

         if (!reply.text) {
            throw new Error("Invalid AI response");
        }

        // Update local history and persist to cookies
        this.pushMessage("user", message);
        this.pushMessage("model", reply.text);
        this.setChatCookie(this.getContents());

        return reply.text;
    }

    /**
     * Saves the current conversation to cookies.
     */
    private async setChatCookie(convo: Message[]) {
        const cookieStore = await cookies();

        cookieStore.set(storageKeys.cookie.convo, JSON.stringify(convo), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
            sameSite: "lax",
        });
    }

    /**
     * Retrieves the current conversation from cookies.
     */
   private async getChatCookie(): Promise<Message[]> {
        const cookieStore = await cookies();
        const raw = cookieStore.get(storageKeys.cookie.convo)?.value;

        if (!raw) 
            return [];

        return JSON.parse(raw) as Message[];
    }

    /**
     * Adds a new message to the local conversation history.
     */
    private pushMessage(role: role, text: string) {
        this.getContents().push({ role, parts: [{ text }] });
    }

    /**
     * Returns the current conversation history.
     */
    private getContents(): Message[] {
        return this.config.history as Message[];
    }

    /**
     * Resets local conversation history (does not clear cookies).
     */
    private resetContents() {
        this.config.history = [];
    }

    /**
     * Clears the conversation cookie and resets history.
     */
    static async clearChatCookie(): Promise<boolean> {
        try {
            const cookieStore = await cookies();
            cookieStore.delete(storageKeys.cookie.convo); 
            return true;
        } catch (error) {
            console.error("Failed to clear chat cookie:", error);
            return false;
        }
    }
    
    /**
     * Checks if the serialized conversation cookie is approaching the typical 4KB size limit.
     *
     * Cookies generally have a size limit of ~4KB per cookie. This method calculates
     * the size of the current conversation stored in the "convo" cookie and returns
     * true if it exceeds 4000 bytes.
     *
     * @returns {Promise<boolean>} - Returns `true` if the cookie size exceeds 4000 bytes, otherwise `false`.
     */
    private async isCookieSizeApproachingLimit(): Promise<boolean> {
        const convo: Message[] = await this.getChatCookie();
        const serializedConvo: string = JSON.stringify(convo);
        const totalBytes: number = new TextEncoder().encode("convo" + "=" + serializedConvo).length;
        
        console.log(`Current size: ${totalBytes} bytes`);
        
        if (totalBytes > 4000) {
            console.warn("⚠️ Warning: Cookie is reaching the 4KB limit!");
            return true;
        }
        
        return false;
    };

    /**
     * Prepares blog generation configuration using a Zod schema.
     */
    private async blogConfig(schema: ZodObject<ZodRawShape>): Promise<AssistantConfig> {
        const BlogServiceInstance = new BlogService();
        let category = await BlogServiceInstance.getLeastInsertedCategory();

        if (!category) {
            const categories = [
                BlogCategoryEnum.Tech,
                BlogCategoryEnum.Study,
                BlogCategoryEnum.Life,
                BlogCategoryEnum.Future,
            ];
            
            category = categories[Math.floor(Math.random() * categories.length)];
        }

        const prompt: string = `
            Generate a blog post for the following category: "${category}"

            ## Category Assignment
            - Category: "${category}"
            - This is your ONLY topic — do not write about anything else
            - Do not change or override the category under any circumstance

            ## Category Context
            - "technology"  → software, development, tools, programming, dev culture
            - "study"       → learning strategies, skill building, self-education
            - "life"        → daily habits, mindset, work-life balance, personal growth
            - "future"      → future of tech, industry predictions, trends worth watching

            ## Reminder
            - category field in JSON MUST be exactly: "${category}"
            - Slug: 3-5 lowercase words, hyphens only, max 40 chars
            - Return ONLY raw JSON — starts with { ends with }
        `;

        console.log("Blog generation prompt:", category);

        this.config.config = {
            responseMimeType: "application/json",
            systemInstruction: this.instruction,
            responseJsonSchema: zodToJsonSchema(schema)
        };

        this.config.history  = [];
        this.config.contents = prompt;

        return this.config;
    }

    /**
     * Generates a blog post based on the instruction and schema.
     */
    async blogMain(): Promise<AIBlogResponse> {
        const matchSchema = z.object({
            id: z.number().optional().default(0),
            title: z.string(),
            slug: z.string(),
            category: z.enum([
                BlogCategoryEnum.Tech, 
                BlogCategoryEnum.Study, 
                BlogCategoryEnum.Future, 
                BlogCategoryEnum.Life
            ]),
            content: z.string(),
            excerpt: z.string(),
            tags: z.array(z.string()),
            reading: z.number(),
            views: z.number().optional().default(0),
            generated_at: z.string().optional().default(new Date().toISOString())
        });

        await this.blogConfig(matchSchema);
        const response = await this.AI.models.generateContent(this.config);

        const rawText = response.text as string;
        const cleaned = rawText
            .replace(/^```json\s*/i, "") // remove opening ```json
            .replace(/^```\s*/i,    "") // remove opening ``` (without json)
            .replace(/```\s*$/,     "") // remove closing ```
            .trim();

        try {
            const blog = matchSchema.parse(JSON.parse(cleaned));
            return blog;
        } catch (error) {
            console.error("Failed to parse AI response:", cleaned, error);
            throw new Error("AI returned invalid JSON structure.");
        }
    }
}
