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
} as const;

export const Table = {
  aiBlog: "ai_blogs",
  rateLimits: "rate_limits",
} as const;

// default export the client
export default supabaseClient;