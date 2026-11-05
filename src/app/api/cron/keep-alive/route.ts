import { NextResponse } from "next/server";
import BlogService from "@/lib/.services/blogService";

// Always hit the database; never serve a cached response.
export const dynamic = "force-dynamic";

/**
 * Daily keep-alive cron (see vercel.json).
 * Runs a tiny query so the free-tier Supabase project
 * is never paused for inactivity.
 */
export async function GET(req: Request) {
    const bearerToken = `Bearer ${process.env.CRON_SECRET}`;

    if (req.headers.get("Authorization") !== bearerToken) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const service = new BlogService();
        const rows = await service.ping();

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
