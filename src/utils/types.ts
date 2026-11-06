import type { ComponentType, SVGProps } from "react";
import { ContentListUnion } from "@google/genai/node";

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

/** Fields Gemini writes for a new post. Reading time and slug uniqueness are handled in code. */
export interface GeneratedBlogPost {
  title:    string;
  slug:     string;
  category: BlogCategoryEnum;
  content:  string;            // markdown
  excerpt:  string;
  tags:     string[];
}

/** A generated post, ready to insert into the blog table. */
export interface NewBlogRow extends GeneratedBlogPost {
  reading: number;             // minutes, computed from word count
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
// PROJECTS
// ============================================================

/** What kind of work a project is (shown as a badge on its card). */
export enum ProjectKindEnum {
  Professional = "Professional Work",
  Personal     = "Personal Project",
  Academic     = "Academic Project",
}

export interface ProjectLink {
  kind:  "live" | "source";
  label: string;
  href:  string;
}

/** A project on the /projects page. All data is static. */
export interface ProjectItem {
  slug:          string;            // stable key
  name:          string;
  tagline:       string;            // one-line summary under the name
  kind?:         ProjectKindEnum;
  role?:         string;            // e.g. "Web & iOS Developer"
  organization?: string;            // company / school
  period?:       string;            // e.g. "2023 – Present"
  description:   string;
  highlights:    string[];          // 0–4 short bullets
  tech:          string[];          // names; logos come from TECH_LOGOS (config/techLogos.ts)
  logo?:         string;            // /public path to a square logo
  image?:        string;            // /public path to a screenshot (featured)
  links:         ProjectLink[];
  note?:         string;            // shown when there are no public links
}

// ============================================================
// TECH STACK
// ============================================================

/** A highlighted tool on the /tech-stack page ("Core Stack."). */
export interface TechTool {
  name:        string;
  description: string;   // one short line
  logo:        string;   // /public path
}

/** A group of tools on the /tech-stack page ("Full Toolkit."). */
export interface TechCategory {
  slug:        string;
  title:       string;
  description: string;   // what the category covers, one line
  icon:        ComponentType<SVGProps<SVGSVGElement>>;
  items:       string[]; // tool names; logos come from TECH_LOGOS
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
  responseJsonSchema?: Record<string, unknown>; // JSON Schema (from z.toJSONSchema)
}

export interface AssistantConfig {
  model:    string;
  config:   AssistantConfigOptions;
  history?: Message[];
  contents: ContentListUnion;
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================

/** A signed-in user who passed the admin check (`public.is_admin()`). */
export interface AdminUser {
  id:          string;
  email:       string;
  displayName: string | null;   // from the profile or auth metadata; null if unknown
}

/** Result of one dashboard query: sections fail independently. */
export type DashboardResult<T> =
  | { ok: true;  data: T }
  | { ok: false; error: string };

/** Totals behind the stat cards and the content overview. */
export interface ContentStats {
  totalProjects:      number;
  publishedProjects:  number;
  draftProjects:      number;
  experiences:        number;
  skills:             number;
  newMessages:        number;
  /** Rows created in the last 30 days — the only history we can show honestly. */
  recent: {
    projects:    number;
    experiences: number;
    skills:      number;
    messages:    number;
  };
  /** Latest change to any content table or the activity log; null when nothing exists. */
  lastContentUpdate:  string | null;
}

export type ActivityAction =
  | "created" | "updated" | "deleted" | "published" | "unpublished" | "received";

export type ActivityEntity =
  | "profile" | "project" | "experience" | "skill" | "skill_category" | "contact_message" | "media";

/** A row of `public.activity_logs`. */
export interface ActivityLog {
  id:          string;
  user_id:     string | null;
  action:      ActivityAction;
  entity_type: ActivityEntity;
  entity_id:   string | null;
  description: string;
  created_at:  string;
}

/** The profile fields that count toward completion (a row of `public.profiles`). */
export interface ProfileRecord {
  full_name:    string | null;
  headline:     string | null;
  bio:          string | null;
  avatar_url:   string | null;
  email:        string | null;
  location:     string | null;
  resume_url:   string | null;
  github_url:   string | null;
  linkedin_url: string | null;
  updated_at:   string;
}

export interface ProfileCompletion {
  percent:   number;           // 0–100
  completed: string[];         // rule labels that pass
  missing:   string[];         // rule labels that fail
  exists:    boolean;          // false when there is no profile row
}

/** Preset or custom date range for the traffic chart. */
export type TrafficRangePreset = "7d" | "30d" | "90d";

export interface TrafficRange {
  from: string;   // YYYY-MM-DD, inclusive (UTC)
  to:   string;   // YYYY-MM-DD, inclusive (UTC)
}

export interface TrafficPoint {
  date:     string;   // YYYY-MM-DD
  visitors: number;   // unique visitors that day
  views:    number;   // page views that day
}

/** What the analytics layer returns: real data, or an honest "not connected". */
export type TrafficResult =
  | {
      available:  true;
      provider:   string;
      range:      TrafficRange;
      points:     TrafficPoint[];
      /** Sum of daily unique visitors (a visitor on two days counts twice). */
      total:      number;
      totalViews: number;
      /** Same-length period right before `range`; omitted if the provider can't tell. */
      previousTotal?: number;
      previousViews?: number;
    }
  | {
      available: false;
      reason:    string;
    };

// ============================================================
// ADMIN — PROJECTS
// ============================================================

export type ProjectStatus = "draft" | "published";

/** A row of `public.projects`. */
export interface ProjectRecord {
  id:           string;
  slug:         string;
  title:        string;
  tagline:      string | null;
  description:  string | null;
  kind:         string | null;    // a ProjectKindEnum value
  role:         string | null;
  organization: string | null;
  period:       string | null;
  highlights:   string[];
  tech:         string[];
  logo_url:     string | null;
  image_url:    string | null;
  live_url:     string | null;
  live_label:   string | null;
  source_url:   string | null;
  source_label: string | null;
  note:         string | null;
  status:       ProjectStatus;
  is_featured:  boolean;
  sort_order:   number;
  published_at: string | null;
  created_at:   string;
  updated_at:   string;
}

// ============================================================
// ADMIN — ACCOUNT
// ============================================================

/** The signed-in admin's Supabase Auth account, for Account Settings. */
export interface AdminAccount {
  id:           string;
  email:        string;
  displayName:  string | null;   // auth user metadata (full_name)
  createdAt:    string;
  lastSignInAt: string | null;
  adminSince:   string | null;   // admin_users.created_at
}

// ============================================================
// ADMIN — PERSONAL PROFILE
// ============================================================

/** The single row of `public.profiles` (owner profile). */
export interface PortfolioProfile extends ProfileRecord {
  id:            string;
  phone:         string | null;
  website_url:   string | null;
  booking_url:   string | null;
  facebook_url:  string | null;
  instagram_url: string | null;
  x_url:         string | null;
  created_at:    string;
}

/** Profile data the public home page renders (with fallbacks applied). */
export interface PublicProfile {
  name:        string;
  headline:    string | null;
  location:    string | null;
  avatarUrl:   string | null;
  bio:         string[];        // paragraphs
  email:       string | null;
  phone:       string | null;
  resumeUrl:   string | null;
  bookingUrl:  string | null;   // "Schedule a Call"
  socials: {                    // header/footer icons; null = hidden
    linkedin:  string | null;
    github:    string | null;
    facebook:  string | null;
    instagram: string | null;
    x:         string | null;
    website:   string | null;
  };
}

// ============================================================
// ADMIN — WORK EXPERIENCE
// ============================================================

export type ExperienceType = "work" | "education" | "milestone";

/** A row of `public.experiences` (one role, degree or milestone). */
export interface ExperienceRecord {
  id:              string;
  entry_type:      ExperienceType;
  company:         string;          // company, school, or milestone title
  position:        string;          // role, degree, or milestone line
  employment_type: string | null;
  location:        string | null;
  start_date:      string;          // YYYY-MM-DD (first of month)
  end_date:        string | null;   // null = current (work/education) or single date (milestone)
  description:     string | null;
  logo_url:        string | null;
  created_at:      string;
  updated_at:      string;
}

/** Fields the timeline needs (DB rows and the static fallback both fit). */
export type TimelineSource = Pick<ExperienceRecord, "entry_type" | "company" | "position" | "start_date" | "end_date" | "logo_url"> & { id?: string };

/** One company/school/milestone on the home page "Experience." card. */
export interface TimelineGroup {
  key:       string;
  company:   string;
  logoUrl:   string | null;
  dateLabel: string;               // "07 / 2023 - Present"
  roles: {
    key:           string;
    position:      string;
    dateLabel:     string;         // "07 / 2021 - 07 / 2023"
    durationLabel: string | null;  // "For 2 Years and 10 Months" (grouped roles only)
  }[];
}

// ============================================================
// ADMIN — MEDIA LIBRARY
// ============================================================

/** Where a media file is used (shown in the library; blocks deletion). */
export interface MediaUsage {
  label: string;   // e.g. "Project “NativeCamp” · logo"
  href:  string;   // admin page to change it
}

/** A row of `public.media_assets` plus its public URL and usages. */
export interface MediaAsset {
  id:          string;
  path:        string;
  url:         string;
  file_name:   string;
  mime_type:   string;
  size_bytes:  number;
  width:       number | null;
  height:      number | null;
  alt_text:    string | null;
  source_path: string | null;
  created_at:  string;
  usages:      MediaUsage[];
}

/** Storage gauge: bytes in the media bucket vs the configured limit. */
export interface StorageUsage {
  usedBytes:  number;
  fileCount:  number;
  limitBytes: number;
}

/** Result of "Import site images". */
export interface MediaImportResult {
  imported:   string[];                          // /public paths uploaded now
  reused:     string[];                          // already in the library
  skipped:    { path: string; reason: string }[];
  references: number;                            // content fields repointed
}
