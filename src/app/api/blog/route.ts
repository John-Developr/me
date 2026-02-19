import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";
import BlogService from "@/lib/.services/blogService";

// Load system instruction server-side
const instruction = fs.readFileSync(
    path.join(process.cwd(), "src/docs/blog-instruction.md"),
    "utf-8"
);

export async function GET() {
    try {
        const service = new BlogService();
        const blogs = await service.getBlogs()
        return NextResponse.json({ blogs });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unknown error occurred" },
            { status: 500 }
        );
    }
}

export async function POST() {
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
