// src/config/AssistantService.ts
import { cookies } from "next/headers";
import { GoogleGenAI, ApiError } from "@google/genai";

import { z, ZodObject, ZodRawShape } from "zod";

import BlogService from "./blogService";

import { AssistantConfig, Message, role, BlogCategoryEnum, GeneratedBlogPost } from "@/utils/types";
import { storageKeys } from "@/config/storageKeys";

// ============================================================
// GEMINI MODEL & API KEYS
// ============================================================

/** Gemini model for the chat assistant and blog generation (pinned, not an alias). */
const GEMINI_MODEL = "gemini-3.6-flash";

/** API keys in priority order; empty ones are skipped. */
const GEMINI_API_KEYS: string[] = [
    process.env.NEXT_SECRET_GEMINI_API_KEY,
    process.env.NEXT_SECRET_GEMINI_API_KEY2,
].filter((key): key is string => !!key);

/** One client per key, created lazily and reused across requests. */
const geminiClients = new Map<string, GoogleGenAI>();

/**
 * Index of the key that last worked. After a key hits its limit, later
 * requests start with the other key instead of failing on the first one again.
 */
let activeKeyIndex = 0;

/**
 * Whether an error is specific to the API key (so another key may succeed):
 * rate/quota limits, invalid or disabled keys, and service unavailability.
 */
function isKeyFallbackError(error: unknown): boolean {
    if (!(error instanceof ApiError)) return false;
    if ([401, 403, 429, 500, 503].includes(error.status)) return true;
    return error.status === 400 && /API_KEY_INVALID|API key/i.test(error.message);
}

/**
 * Runs a Gemini call with automatic key fallback: tries the active key first,
 * and on a key-specific error retries with the next key.
 *
 * @param call - Receives a client for the key being tried
 * @throws The last error if every key fails, or immediately for non-key errors
 */
async function withGeminiKeyFallback<T>(call: (ai: GoogleGenAI) => Promise<T>): Promise<T> {
    if (GEMINI_API_KEYS.length === 0) {
        throw new Error("No Gemini API key configured.");
    }

    let lastError: unknown;

    for (let offset = 0; offset < GEMINI_API_KEYS.length; offset++) {
        const index = (activeKeyIndex + offset) % GEMINI_API_KEYS.length;
        const key   = GEMINI_API_KEYS[index];

        let client = geminiClients.get(key);
        if (!client) {
            client = new GoogleGenAI({ apiKey: key });
            geminiClients.set(key, client);
        }

        try {
            const result   = await call(client);
            activeKeyIndex = index;
            return result;
        } catch (error) {
            lastError = error;

            if (!isKeyFallbackError(error)) throw error;

            // Log which key slot failed (never the key itself).
            const status = error instanceof ApiError ? error.status : "unknown";
            console.warn(`[Gemini] key #${index + 1} failed with ${status}; trying the next key.`);
        }
    }

    throw lastError;
}

/**
 * ChatService handles interactions with the GoogleGenAI API,
 * maintains conversation history, and provides utilities for
 * blog generation.
 */

export default class ChatService {
    private config: AssistantConfig; // Configuration for AI chat
    private instruction: string; // System instruction for AI

    constructor(instruction: string) {
        this.instruction = instruction;

        // Default chat configuration
        this.config = {
            model: GEMINI_MODEL,
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
        const reply = await withGeminiKeyFallback(async (ai) => {
            const chat = ai.chats.create(this.config);
            return chat.sendMessage({ message });
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
        
        if (totalBytes > 4000) {
            console.warn("⚠️ Warning: Cookie is reaching the 4KB limit!");
            return true;
        }
        
        return false;
    };

    /**
     * Prepares blog generation configuration using a Zod schema.
     *
     * @param schema       - Shape the model must return
     * @param recentTitles - Latest post titles, so topics and title patterns don't repeat
     * @param forced       - Category chosen by the admin; otherwise the least used one
     */
    private async blogConfig(
        schema: ZodObject<ZodRawShape>,
        recentTitles: string[],
        forced?: string,
    ): Promise<AssistantConfig> {
        let category = forced ?? await new BlogService().getLeastInsertedCategory();

        if (!category) {
            const categories = [
                BlogCategoryEnum.Tech,
                BlogCategoryEnum.Study,
                BlogCategoryEnum.Life,
                BlogCategoryEnum.Future,
            ];
            
            category = categories[Math.floor(Math.random() * categories.length)];
        }

        const recentList = recentTitles.length
            ? recentTitles.map((title) => `- ${title}`).join("\n")
            : "- (none yet)";

        const prompt: string = `
            Write a new blog post for the category: "${category}"

            ## Category
            - The "category" field MUST be exactly: "${category}"
            - Write only about this category — never switch topics

            ## Recent posts — do NOT repeat these topics, angles, or title patterns
            ${recentList}
        `;

        this.config.config = {
            responseMimeType: "application/json",
            systemInstruction: this.instruction,
            responseJsonSchema: z.toJSONSchema(schema)
        };

        this.config.history  = [];
        this.config.contents = prompt;

        return this.config;
    }

    /**
     * Generates a blog post based on the instruction and schema.
     * Only asks the model for the fields it should write; ids, views,
     * dates, reading time and slug uniqueness are handled in code.
     *
     * @param recentTitles - Latest post titles to avoid repeating
     * @param category     - Category to write about (admin "Generate with AI"); cron leaves it unset
     * @throws When the model returns nothing or an invalid structure
     */
    async blogMain(recentTitles: string[] = [], category?: string): Promise<GeneratedBlogPost> {
        const matchSchema = z.object({
            title:    z.string().min(1),
            slug:     z.string(),
            category: z.enum([
                BlogCategoryEnum.Tech, 
                BlogCategoryEnum.Study, 
                BlogCategoryEnum.Future, 
                BlogCategoryEnum.Life
            ]),
            content:  z.string().min(1),
            excerpt:  z.string().min(1),
            tags:     z.array(z.string()),
        });

        await this.blogConfig(matchSchema, recentTitles, category);
        const response = await withGeminiKeyFallback((ai) => ai.models.generateContent(this.config));

        if (!response.text) {
            throw new Error("AI returned an empty response.");
        }

        try {
            return matchSchema.parse(JSON.parse(response.text));
        } catch (error) {
            console.error("Failed to parse AI response:", response.text, error);
            throw new Error("AI returned invalid JSON structure.");
        }
    }
}
