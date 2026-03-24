import { ContentListUnion } from "@google/genai/node";
import { zodToJsonSchema } from "zod-to-json-schema";

// ============================================================
// BLOG
// ============================================================

export enum BlogCategoryEnum {
  All    = "All",
  Tech   = "technology",
  Study  = "study",
  Life   = "life",
  Future = "future",
}

export enum BlogSortEnum {
  asc  = "asc",
  desc = "desc",
}

export type blogCategory = BlogCategoryEnum[keyof BlogCategoryEnum];

export interface BlogCategoryItem {
  name:   BlogCategoryEnum;
  active: boolean;
}

export interface AIBlogResponse {
  id:           number;    // unique identifier
  title:        string;    // blog title (8–12 words recommended)
  slug?:        string;    // SEO-friendly URL slug
  category?:    blogCategory; // category of the blog
  content?:     string;    // full blog content (300–400+ words)
  excerpt:      string;    // summary/excerpt (30–50 words)
  tags:         string[];  // relevant tags (3–5 recommended)
  reading:      number;    // estimated reading time in minutes
  views?:       number;    // number of views (default 0)
  generated_at: string;    // timestamp of when blog was generated
}

// ============================================================
// FETCH STATE
// ============================================================

export enum FetchStateEnum {
  idle    = "idle",
  loading = "loading",
  error   = "error",
  success = "success",
}

export type fetchState = keyof typeof FetchStateEnum;

// ============================================================
// THEME
// ============================================================

export enum ThemeEnum {
  light = "light",
  dark  = "dark",
}

export type theme = keyof typeof ThemeEnum;

// ============================================================
// OVERLAY
// ============================================================

export enum OverlayType {
  welcome   = "welcome",
  preloader = "preloader",
}

export interface OverlayState {
  type:    OverlayType;
  visible: boolean;
};

// ============================================================
// NAVIGATION
// ============================================================

export enum AppPagesEnum {
  Home       = "/",
  Blog       = "/blog",
  BlogDetail = "/blog/[slug]",
}

// ============================================================
// CONTACT FORM
// ============================================================

export enum InquiryType {
  JobOpportunity   = "Job Opportunity",
  FreelanceProject = "Freelance Project",
  GeneralInquiry   = "General Inquiry",
}

export interface ContactFormData {
  fname:    string;      // first name
  lname:    string;      // last name
  email:    string;      // email address
  subject:  string;      // message subject
  type:     InquiryType; // inquiry type
  budget?:  string;      // optional budget (freelance only)
  message:  string;      // main message
}

// ============================================================
// AI ASSISTANT / CHAT
// ============================================================

export enum RoleEnum {
  user  = "user",
  model = "model",
}

export type role = keyof typeof RoleEnum;

export interface MessagePart {
  text: string; // actual message content
}

export interface Message {
  role:  role;          // sender role (user or model)
  parts: MessagePart[]; // array of text parts
}

export interface AssistantConfigOptions {
  responseModalities?: string[];
  responseMimeType?:   string;
  systemInstruction?:  string;
  responseJsonSchema?: ReturnType<typeof zodToJsonSchema>;
}

export interface AssistantConfig {
  model:    string;
  config:   AssistantConfigOptions;
  history?: Message[];
  contents: ContentListUnion;
}