// src/config/AssistantService.ts
import { cookies } from "next/headers";
import { GoogleGenAI, ApiError } from "@google/genai";

import { z, ZodObject, ZodRawShape } from "zod";

import BlogService from "./blogService";

import { AssistantConfig, Message, role, BlogCategoryEnum, GeneratedBlogPost } from "@/utils/types";
import { storageKeys } from "@/config/storageKeys";
import { fitHistory, parseHistory } from "@/utils/chatHistory";

// ============================================================
// GEMINI MODEL & API KEYS
// ============================================================

/** Gemini model for the chat assistant and blog generation (pinned, not an alias). */
const GEMINI_MODEL = "gemini-3.6-flash";

/**
 * Used when GEMINI_MODEL is overloaded, not responding or out of quota on
 * every key. Google's "high demand" 503s hit a model for all keys at once,
 * so switching keys alone doesn't help.
 */
const GEMINI_FALLBACK_MODEL = "gemini-3.1-flash-lite";

/** Models in the order they are tried. */
const GEMINI_MODELS = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL];

/**
 * Time limit for one Gemini attempt, in ms. Without it an overloaded model
 * can hang for minutes and the fallback never gets a turn. Blog posts are
 * longer to write; 40 s + the fallback still fits the routes' 60 s maxDuration.
 */
const CHAT_TIMEOUT_MS = 20_000;
const BLOG_TIMEOUT_MS = 40_000;

/** API keys in priority order; empty ones are skipped. */
const GEMINI_API_KEYS: string[] = [
    process.env.NEXT_SECRET_GEMINI_API_KEY,
    process.env.NEXT_SECRET_GEMINI_API_KEY2,
    process.env.NEXT_SECRET_GEMINI_API_KEY3,
    process.env.NEXT_SECRET_GEMINI_API_KEY4,
].filter((key): key is string => !!key);

/** One client per key, created lazily and reused across requests. */
const geminiClients = new Map<string, GoogleGenAI>();

/**
 * Index of the key that last worked. After a key hits its limit, later
 * requests start with the next key instead of failing on the first one again.
 */
let activeKeyIndex = 0;

/**
 * Whether an error is specific to the API key (so another key may succeed):
 * rate/quota limits and invalid or disabled keys.
 */
function isKeyError(error: unknown): boolean {
    if (!(error instanceof ApiError)) return false;
    if ([401, 403, 429].includes(error.status)) return true;
    return error.status === 400 && /API_KEY_INVALID|API key/i.test(error.message);
}

/**
 * Whether the model itself is unavailable (overloaded, server error or our
 * time limit). Other keys would hit the same model, so the next model is tried.
 */
function isModelError(error: unknown): boolean {
    if (error instanceof ApiError) return [500, 502, 503, 504].includes(error.status);
    return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

/** Short reason for the log line (never includes the key). */
function failureReason(error: unknown): string {
    if (error instanceof ApiError) return String(error.status);
    return error instanceof Error ? error.name : "unknown";
}

/**
 * Runs a Gemini call with automatic fallback. For each model in GEMINI_MODELS,
 * tries the keys starting with the one that last worked: a key error moves to
 * the next key, a model error moves to the next model.
 *
 * @param call - Receives a client for the key being tried and the model to use
 * @throws The last error if everything fails, or immediately for other errors
 */
async function withGeminiFallback<T>(call: (ai: GoogleGenAI, model: string) => Promise<T>): Promise<T> {
    if (GEMINI_API_KEYS.length === 0) {
        throw new Error("No Gemini API key configured.");
    }

    let lastError: unknown;

    for (const model of GEMINI_MODELS) {
        for (let offset = 0; offset < GEMINI_API_KEYS.length; offset++) {
            const index = (activeKeyIndex + offset) % GEMINI_API_KEYS.length;
            const key   = GEMINI_API_KEYS[index];

            let client = geminiClients.get(key);
            if (!client) {
                client = new GoogleGenAI({ apiKey: key });
                geminiClients.set(key, client);
            }

            try {
                const result   = await call(client, model);
                activeKeyIndex = index;
                return result;
            } catch (error) {
                lastError = error;

                const modelDown = isModelError(error);
                if (!modelDown && !isKeyError(error)) throw error;

                // Log which key slot failed (never the key itself).
                console.warn(
                    `[Gemini] ${model} key #${index + 1} failed with ${failureReason(error)}; ` +
                    (modelDown ? "trying the next model." : "trying the next key.")
                );

                if (modelDown) break;
            }
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
     * Keeps the conversation in a cookie, dropping the oldest turns so it
     * always fits (see utils/chatHistory.ts).
     */
    async index(message: string): Promise<string> {
        this.config.history = await this.getChatCookie();

        // Create chat session and send message
        const reply = await withGeminiFallback(async (ai, model) => {
            const chat = ai.chats.create({
                ...this.config,
                model,
                config: { ...this.config.config, httpOptions: { timeout: CHAT_TIMEOUT_MS } },
            });
            return chat.sendMessage({ message });
        });

         if (!reply.text) {
            throw new Error("Invalid AI response");
        }

        // Update local history and persist to cookies
        this.pushMessage("user", message);
        this.pushMessage("model", reply.text);
        await this.setChatCookie(fitHistory(this.getContents(), storageKeys.cookie.convo));

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
     * The cookie is visitor-controlled: malformed or tampered values count as no history.
     */
   private async getChatCookie(): Promise<Message[]> {
        const cookieStore = await cookies();
        return parseHistory(cookieStore.get(storageKeys.cookie.convo)?.value);
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
        const response = await withGeminiFallback((ai, model) => ai.models.generateContent({
            ...this.config,
            model,
            config: { ...this.config.config, httpOptions: { timeout: BLOG_TIMEOUT_MS } },
        }));

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
