import { NextResponse } from "next/server";

import AdminAuthService from "@/lib/.services/adminAuthService";
import AdminBlogService from "@/lib/.services/adminBlogService";
import { revalidateBlogPages } from "@/lib/.services/blogRouteHelpers";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { blogInputSchema } from "@/utils/admin/blogSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

/** Create a blog post (admins only). Body: BlogInput. */
export async function POST(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const parsed = blogInputSchema.safeParse(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    const post = await new AdminBlogService(auth.session.client).create(parsed.data);
    revalidateBlogPages();

    return NextResponse.json({ message: "Post created.", data: post, result: true }, { status: 201 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/blogs POST", "Something went wrong saving the post.");
  }
}
