import { NextResponse } from "next/server";

import AdminAuthService from "@/lib/.services/adminAuthService";
import ProjectService from "@/lib/.services/projectService";
import { projectErrorResponse, revalidateProjectPages } from "@/lib/.services/projectRouteHelpers";
import { projectInputSchema } from "@/utils/admin/projectSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

/** Create a project (admins only). Body: ProjectInput. */
export async function POST(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const parsed = projectInputSchema.safeParse(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    const project = await new ProjectService(auth.session.client).create(parsed.data);
    revalidateProjectPages();

    return NextResponse.json({ message: "Project created.", data: project, result: true }, { status: 201 });
  } catch (error) {
    return projectErrorResponse(error, "api/admin/projects POST");
  }
}

