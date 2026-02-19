// src/config/AssistantService.ts
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";

import { z, ZodObject, ZodRawShape } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { AssistantConfig, Message, Role, AIBlogResponse } from "@/utils/types";

/**
 * ChatService handles interactions with the GoogleGenAI API,
 * maintains conversation history, and provides utilities for
 * blog generation.
 */

export default class ChatService {
    private AI: any; // GoogleGenAI instance
    private config: AssistantConfig; // Configuration for AI chat
    private instruction: string; // System instruction for AI

    constructor(instruction: string) {
        this.instruction = instruction;

        // Initialize AI instance with API key
        this.AI = new GoogleGenAI({
            apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY2,
        });

        // Default chat configuration
        this.config = {
            model: "gemini-2.5-flash",
            config: {
                responseModalities: ["text"],
                systemInstruction: this.instruction
            },
            history: [],
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

        cookieStore.set("convo", JSON.stringify(convo), {
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
        const raw = cookieStore.get("convo")?.value;

        if (!raw) 
            return [];

        return JSON.parse(raw) as Message[];
    }

    /**
     * Adds a new message to the local conversation history.
     */
    private pushMessage(role: Role, text: string) {
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
            cookieStore.delete("convo"); 
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
            return true
        }
        
        return false;
    };

    /**
     * Prepares blog generation configuration using a Zod schema.
     */
    private blogConfig(schema: ZodObject<ZodRawShape>) {
        const prompt: string = `
            Write a new blog post based on the instruction, 
            use a different category and stay align with my instruction.
        `;

        this.config.config = {
            responseMimeType: "application/json",
            systemInstruction: this.instruction,
            responseJsonSchema: zodToJsonSchema(schema)
        };
        
        this.config.contents = prompt;
    }

    /**
     * Generates a blog post based on the instruction and schema.
     */
    async blogMain(): Promise<AIBlogResponse> {
        const matchSchema = z.object({
            id: z.number(),
            title: z.string(),
            slug: z.string(),
            category: z.enum(["technology","study","future","life"]),
            content: z.string(),
            excerpt: z.string(),
            tags: z.array(z.string()),
            reading: z.number(),
            views: z.number(),
            generated_at: z.string(),
        });

        this.blogConfig(matchSchema)

        const response = await this.AI.models.generateContent(this.config);
        const blog = matchSchema.parse(JSON.parse(response.text));

        return blog;
    }
}
