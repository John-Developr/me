import { NextResponse, after } from "next/server";
import BlogService from "@/lib/.services/blogService";
import { AIBlogResponse } from "@/utils/types";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  console.log("Received request for blog slug:", slug);

  try {
    const blogService = new BlogService();
    const blog: AIBlogResponse[]  = await blogService.findBySlug(slug);

    if (!blog || blog.length === 0) {
      return NextResponse.json(
        { message: "Blog not found.", result: false },
        { status: 404 }
      );
    }

    // findBySlug uses .single(), so the payload is one record despite the array type.
    const currentViews = (blog as unknown as AIBlogResponse).views ?? 0;

    // Count the view after the response is sent, so readers don't wait on it.
    after(() => blogService.incrementViews(slug, currentViews));

    return NextResponse.json(
      { blog }, 
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error", result: false },
      { status: 500 }
    );
  }
}