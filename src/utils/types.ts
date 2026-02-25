import { ContentListUnion } from "@google/genai/node";
import { zodToJsonSchema } from "zod-to-json-schema";

// =====================
// BlogCategory Enum
// =====================
export enum BlogCategoryEnum {
  Tech = "technology",
  Study = "study",
  Life = "life",
  Future = "future",
}

// =====================
// BlogCategory Type
// =====================
// Union type of all enum values
export type BlogCategory = BlogCategoryEnum[keyof BlogCategoryEnum];

// =====================
// AIBlogResponse Interface
// =====================
// Response returned by the AI blog generator
export interface AIBlogResponse {
  id: number;                     // unique identifier for the blog post
  title: string;                  // blog title (8–12 words recommended)
  slug?: string;                   // SEO-friendly URL slug
  category?: BlogCategory;         // category of the blog
  content?: string;                // full blog content (300–400+ words)
  excerpt: string;                // summary/excerpt (30–50 words)
  tags: string[];                 // relevant tags (3–5 recommended)
  reading: number;                // estimated reading time
  views?: number;                  // number of views (default 0)
  generated_at: string;           // timestamp of when the blog was generated
}

// =====================
// Role Type
// =====================
// Represents the role of a message sender
export type Role = "user" | "model";

// =====================
// MessagePart Interface
// =====================
// Represents a single text part in a message
export interface MessagePart {
  text: string;  // actual message content
}

// =====================
// Message Interface
// =====================
// Represents a complete message sent by a user or model
export interface Message {
  role: Role;           // sender's role (user or AI model)
  parts: MessagePart[]; // array of text parts (can support multiple segments)
}

// =====================
// AssistantConfigOptions Interface
// =====================
// Optional configuration for the AI assistant
export interface AssistantConfigOptions {
  responseModalities?: string[];          // preferred response types (text, audio, etc.)
  responseMimeType?: string;              // desired MIME type of the response
  systemInstruction?: string;             // instructions to guide AI behavior
  responseJsonSchema?: ReturnType<typeof zodToJsonSchema>; // optional JSON schema for structured output
}

// =====================
// AssistantConfig Interface
// =====================
// Main configuration object for the AI assistant
export interface AssistantConfig {
  model: string;                        // model name/version to use
  config: AssistantConfigOptions;       // nested configuration options
  history?: Message[];                  // previous messages for context
  contents: ContentListUnion;           // current content to process
}

// =====================
// AppPages Enum
// =====================
export enum AppPagesEnum {
  Home = "/",
  Blog = "/blog",
  BlogDetail = "/blog/[slug]",
}