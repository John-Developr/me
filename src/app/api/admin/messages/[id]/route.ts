import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import AdminAuthService from "@/lib/.services/adminAuthService";
import MessageService from "@/lib/.services/messageService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { messageStatusSchema } from "@/utils/admin/messageSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const idSchema = z.uuid();
const notFound = () => NextResponse.json({ message: "Message not found.", result: false }, { status: 404 });

/** Mark a message unread, read or archived (admins only). */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!idSchema.safeParse(id).success) return notFound();

    const parsed = messageStatusSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid status.", errors: toFieldErrors(parsed.error), result: false },
        { status: 400 }
      );
    }

    const message = await new MessageService(auth.session.client).setStatus(id, parsed.data.status);
    // The bell count and the dashboard's "New Messages" render in the admin layout.
    revalidatePath("/admin", "layout");

    return NextResponse.json({ message: "Message updated.", data: message, result: true }, { status: 200 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/messages/:id PATCH");
  }
}

/** Permanently delete a message (admins only). */
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!idSchema.safeParse(id).success) return notFound();

    await new MessageService(auth.session.client).remove(id);
    revalidatePath("/admin", "layout");

    return NextResponse.json({ message: "Message deleted.", result: true }, { status: 200 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/messages/:id DELETE");
  }
}
