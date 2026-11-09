// lib/supabaseClient.ts (browser)
import { createClient } from "@supabase/supabase-js";

// create the client
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SECRET_SUPABASE_ROLE_KEY!
);

// export RPC object
export const RPC = {
  getLeastInsertedCategory: "get_least_inserted_category",
  checkRateLimit: "check_rate_limit",
  isAdmin: "is_admin",
  mediaStorageUsage: "media_storage_usage",
  recordPageView: "record_page_view",
  trafficDaily: "traffic_daily",
  prunePageViews: "prune_page_views",
  trafficBreakdown: "traffic_breakdown",
  recentVisitors: "recent_visitors",
} as const;

export const Table = {
  aiBlog: "ai_blogs",
  rateLimits: "rate_limits",
  adminUsers: "admin_users",
  profiles: "profiles",
  projects: "projects",
  experiences: "experiences",
  skillCategories: "skill_categories",
  skills: "skills",
  contactMessages: "contact_messages",
  activityLogs: "activity_logs",
  mediaAssets: "media_assets",
  siteSettings: "site_settings",
} as const;

// default export the client
export default supabaseClient;