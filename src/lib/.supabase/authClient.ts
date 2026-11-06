import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client that acts **as the signed-in user** (anon key + session cookies).
 *
 * Use it for admin reads/writes so Row Level Security applies — unlike the
 * service-role client in `./server.ts`, which bypasses RLS.
 *
 * Create one per request (server components, route handlers). Cookie writes
 * only succeed in route handlers; in server components they are ignored and
 * the middleware refreshes the session instead.
 */
export async function createAuthClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a server component: cookies are read-only there.
            // The middleware keeps the session fresh, so this is safe to ignore.
          }
        },
      },
    }
  );
}
