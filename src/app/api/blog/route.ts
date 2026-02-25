import { NextResponse } from "next/server";
import BlogService from "@/lib/.services/blogService";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);     
        const service = new BlogService();
        const blogs = await service.getBlogs(searchParams)
        return NextResponse.json({ blogs });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unknown error occurred" },
            { status: 500 }
        );
    }
}

