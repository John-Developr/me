import { NextResponse } from "next/server"
import ChatService from "./lib/.services/chatService";

export async function middleware() {
    await ChatService.clearChatCookie();
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
