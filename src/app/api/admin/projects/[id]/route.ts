import { NextResponse } from "next/server";
import { z } from "zod";

import AdminAuthService from "@/lib/.services/adminAuthService";
import ProjectService from "@/lib/.services/projectService";
import { projectErrorResponse, revalidateProjectPages } from "@/lib/.services/projectRouteHelpers";
import { parseProjectPatch } from "@/utils/admin/projectSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const idSchema = z.uuid();

/** Update any subset of a project's fields (admins only). */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!idSchema.safeParse(id).success) return notFound();

    const parsed = parseProjectPatch(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ message: "Nothing to update.", result: false }, { status: 400 });
    }

    const project = await new ProjectService(auth.session.client).update(id, parsed.data);
    revalidateProjectPages();

    return NextResponse.json({ message: "Project saved.", data: project, result: true }, { status: 200 });
  } catch (error) {
    return projectErrorResponse(error, "api/admin/projects/:id PATCH");
  }
}

/** Permanently delete a project (admins only). */
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!idSchema.safeParse(id).success) return notFound();

    await new ProjectService(auth.session.client).remove(id);
    revalidateProjectPages();

    return NextResponse.json({ message: "Project deleted.", result: true }, { status: 200 });
  } catch (error) {
    return projectErrorResponse(error, "api/admin/projects/:id DELETE");
  }
}

const notFound = () => NextResponse.json({ message: "Project not found.", result: false }, { status: 404 });

