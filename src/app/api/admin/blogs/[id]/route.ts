import { NextResponse } from "next/server";
import { z } from "zod";

import AdminAuthService from "@/lib/.services/adminAuthService";
import AdminBlogService from "@/lib/.services/adminBlogService";
import { revalidateBlogPages } from "@/lib/.services/blogRouteHelpers";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { parseBlogPatch } from "@/utils/admin/blogSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/** `ai_blogs.id` is a bigint. */
const idSchema = z.coerce.number().int().positive();

/** Update any subset of a post's fields, e.g. `{ status: "published" }` (admins only). */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const id = idSchema.safeParse((await params).id);
    if (!id.success) return notFound();

    const parsed = parseBlogPatch(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ message: "Nothing to update.", result: false }, { status: 400 });
    }

    const post = await new AdminBlogService(auth.session.client).update(id.data, parsed.data);
    revalidateBlogPages();

    return NextResponse.json({ message: "Post saved.", data: post, result: true }, { status: 200 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/blogs/:id PATCH", "Something went wrong saving the post.");
  }
}

/** Permanently delete a post (admins only). */
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const id = idSchema.safeParse((await params).id);
    if (!id.success) return notFound();

    await new AdminBlogService(auth.session.client).remove(id.data);
    revalidateBlogPages();

    return NextResponse.json({ message: "Post deleted.", result: true }, { status: 200 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/blogs/:id DELETE", "Something went wrong deleting the post.");
  }
}

const notFound = () => NextResponse.json({ message: "Post not found.", result: false }, { status: 404 });
