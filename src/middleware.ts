import { NextResponse, type NextRequest } from "next/server"
import ChatService from "./lib/.services/chatService";
import { updateAdminSession } from "./lib/.supabase/middlewareClient";

const ADMIN_PATH = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

export async function middleware(request: NextRequest) {
    await ChatService.clearChatCookie();

    const { pathname } = request.nextUrl;

    if (pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`)) {
        return guardAdmin(request);
    }

    return NextResponse.next();
}

/**
 * Admin pages: refresh the Supabase session and send signed-out visitors to
 * the login page. This is the first gate only — the admin layout re-checks
 * admin access server-side, and RLS enforces it in the database.
 */
async function guardAdmin(request: NextRequest): Promise<NextResponse> {
    const { response, isSignedIn } = await updateAdminSession(request);

    if (!isSignedIn && request.nextUrl.pathname !== ADMIN_LOGIN_PATH) {
        const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
        loginUrl.searchParams.set("next", request.nextUrl.pathname);

        const redirect = NextResponse.redirect(loginUrl);
        // Carry over any cookie changes (e.g. a cleared expired session).
        response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
        return redirect;
    }

    return response;
}

// Configure the matcher to exclude static files and public pages
export const config = {
    matcher: [
        /*
        * Match all request paths except for the ones starting with:
        * - api (API routes)
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}
