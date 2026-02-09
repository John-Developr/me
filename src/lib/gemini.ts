import { AssistantConfig } from "@/config/assistantConfig";
import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ 
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY 
});

export async function generateContent(config: AssistantConfig) {
    try {
        const response = await ai.models.generateContent(config); return response;
    } catch (error) {
        console.error("Error generating content:", error);
        throw new Error("Failed to generate content");
    }
}