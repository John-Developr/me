import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

import AdminAuthService from "@/lib/.services/adminAuthService";
import BlogService from "@/lib/.services/blogService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { blogGenerateSchema } from "@/utils/admin/blogSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

// Gemini generation (with retries) can take well over the default timeout.
export const maxDuration = 60;
export const dynamic     = "force-dynamic";

// Same prompt as the monthly cron.
const instruction = fs.readFileSync(
  path.join(process.cwd(), "src/docs/blog-instruction.md"),
  "utf-8"
);

/**
 * Writes a post with Gemini for the chosen category (admins only).
 * Nothing is saved: the admin reviews it in the form and saves it as
 * a draft or publishes it. Body: `{ category }`.
 */
export async function POST(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const parsed = blogGenerateSchema.safeParse(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Choose a category.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    const service = new BlogService();
    const post    = await service.generate(instruction, parsed.data.category);
    const slug    = await service.getUniqueSlug(post.slug);

    return NextResponse.json({ message: "Post generated.", data: { ...post, slug }, result: true }, { status: 200 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/blogs/generate POST", "The AI couldn't write a post right now. Try again in a minute.");
  }
}
