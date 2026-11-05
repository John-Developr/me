import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";
import BlogService from "@/lib/.services/blogService";
import { isCronAuthorized } from "@/utils/general/helpers";

// Gemini generation (with retries) can take well over the default timeout.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Load system instruction server-side
const instruction = fs.readFileSync(
    path.join(process.cwd(), "src/docs/blog-instruction.md"),
    "utf-8"
);

/**
 * Monthly blog generation cron (see vercel.json).
 * Append `?dry=1` to generate and return a post without saving it.
 */
export async function GET(req: Request) {
    if (!isCronAuthorized(req)) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const service = new BlogService();
        const dryRun  = new URL(req.url).searchParams.get("dry") === "1";

        if (dryRun) {
            const post = await service.generate(instruction);
            return NextResponse.json({ status: 200, dryRun: true, post });
        }

        const slug = await service.index(instruction);

        return NextResponse.json({
            status: 200,
            slug,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Blog cron failed:", error);

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unknown error occurred" },
            { status: 500 }
        );
    }
}
