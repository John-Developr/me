import { NextResponse } from "next/server";
import BlogService, { BLOG_LIST_CACHE_HEADERS } from "@/lib/.services/blogService";
import { AIBlogResponse } from "@/utils/types";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);     
        const service = new BlogService();
        const blogs: AIBlogResponse[] = await service.getBlogs(searchParams)
        return NextResponse.json({ blogs }, { headers: BLOG_LIST_CACHE_HEADERS });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unknown error occurred" },
            { status: 500 }
        );
    }
}

