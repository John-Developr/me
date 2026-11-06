import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase session for an admin request and reports who is signed in.
 *
 * Runs in middleware (Edge runtime), where refreshed tokens can be written
 * back to both the request (for this render) and the response (for the browser).
 *
 * @returns The response to continue with (carrying any refreshed cookies)
 *          and whether a valid user session exists.
 */
export async function updateAdminSession(
  request: NextRequest,
): Promise<{ response: NextResponse; isSignedIn: boolean }> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    }
  );

  // getUser() validates the token with Supabase Auth (getSession() alone would trust the cookie).
  const { data: { user } } = await supabase.auth.getUser();

  return { response, isSignedIn: !!user };
}
