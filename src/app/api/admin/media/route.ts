import { NextResponse } from "next/server";

import AdminAuthService from "@/lib/.services/adminAuthService";
import MediaService from "@/lib/.services/mediaService";
import { serviceErrorResponse } from "@/lib/.services/serviceError";
import { formatBytes, MAX_UPLOAD_BYTES } from "@/utils/media";

export const dynamic = "force-dynamic";

/** Library contents and storage usage (admins only). Used by the picker dialog. */
export async function GET() {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    const service = new MediaService(auth.session.client);
    const [assets, usage] = await Promise.all([service.list(), service.storageUsage()]);

    return NextResponse.json(
      { result: true, data: { assets, usage } },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/media GET");
  }
}

/**
 * Upload one file (multipart form: `file`, optional `width`, `height`).
 * Type is checked from the file's bytes; size and storage limit are enforced.
 */
export async function POST(req: Request) {
  try {
    const auth = await AdminAuthService.authorizeRequest();
    if (!auth.ok) return auth.response;

    // Reject oversized bodies before reading them.
    const declared = Number(req.headers.get("content-length") ?? 0);
    if (declared > MAX_UPLOAD_BYTES + 64 * 1024) {
      return NextResponse.json(
        { message: `Files can be up to ${formatBytes(MAX_UPLOAD_BYTES)}.`, result: false },
        { status: 413 }
      );
    }

    const form = await req.formData().catch(() => null);
    const file = form?.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Choose a file to upload.", result: false }, { status: 400 });
    }

    const toInt = (v: FormDataEntryValue | null | undefined) => (typeof v === "string" && v ? Number(v) : null);

    const asset = await new MediaService(auth.session.client).upload({
      bytes:        new Uint8Array(await file.arrayBuffer()),
      originalName: file.name,
      width:        toInt(form?.get("width")),
      height:       toInt(form?.get("height")),
    });

    return NextResponse.json({ message: "File uploaded.", data: asset, result: true }, { status: 201 });
  } catch (error) {
    return serviceErrorResponse(error, "api/admin/media POST", "Something went wrong uploading the file.");
  }
}
