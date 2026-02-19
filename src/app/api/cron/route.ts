import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";
import BlogService from "@/lib/.services/blogService";

// Load system instruction server-side
const instruction = fs.readFileSync(
    path.join(process.cwd(), "src/docs/blog-instruction.md"),
    "utf-8"
);

export async function GET(req: Request) {
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const service = new BlogService();
        await service.index(instruction)

        return NextResponse.json({ 
            status: 200, 
            timestamp: new Date().toISOString() 
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unknown error occurred" },
            { status: 500 }
        );
    }
}
