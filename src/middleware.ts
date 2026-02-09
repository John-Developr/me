import { NextResponse, type NextRequest } from "next/server"
// import { supabase } from "@/utils/supabase"
import { PublicRoutes, PrivateRoutes, site } from "@/config/siteConfig"

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isLoginPage = pathname === PublicRoutes.Login;
    const isPrivateRoute = site
        .getPrivateRoutes()
        .some(route => pathname.startsWith(route));

    // Public non-login routes → allow immediately
    if (!isLoginPage && !isPrivateRoute) {
        return NextResponse.next();
    }

    // const user = await supabase.getCurrentUser();

    // console.log(user)

    // // Logged-in user trying to access login page
    // if (user && isLoginPage) {
    //     return NextResponse.redirect(
    //         new URL(PrivateRoutes.dashboard, request.url)
    //     );
    // }

    // // Not logged-in user trying to access private routes
    // if (!user && isPrivateRoute) {
    //     return NextResponse.redirect(
    //         new URL(PublicRoutes.Login, request.url)
    //     );
    // }

    return NextResponse.next();
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
