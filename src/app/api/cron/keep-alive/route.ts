import { NextResponse } from "next/server";
import BlogService from "@/lib/.services/blogService";
import RateLimitService from "@/lib/.services/rateLimitService";
import { isCronAuthorized } from "@/utils/general/helpers";

// Always hit the database; never serve a cached response.
export const dynamic = "force-dynamic";

/**
 * Daily keep-alive cron (see vercel.json).
 * Runs a tiny query so the free-tier Supabase project
 * is never paused for inactivity.
 */
export async function GET(req: Request) {
    if (!isCronAuthorized(req)) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const service = new BlogService();
        const rows = await service.ping();

        // Piggyback: prune day-old rate-limit counters.
        await new RateLimitService().cleanup();

        return NextResponse.json({
            status: 200,
            rows,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unknown error occurred" },
            { status: 500 }
        );
    }
}
