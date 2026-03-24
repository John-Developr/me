import { NextResponse } from "next/server";
import BlogService from "@/lib/.services/blogService";

import { AIBlogResponse } from "@/utils/types";

export async function GET() {
    try {  
        const service = new BlogService();
        const blogs: AIBlogResponse[] = await service.getRecentBlogs();
        return NextResponse.json({ blogs });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unknown error occurred" },
            { status: 500 }
        );
    }
}