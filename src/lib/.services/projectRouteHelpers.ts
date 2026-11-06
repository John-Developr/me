import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { serviceErrorResponse } from "./serviceError";

/**
 * Pages that show project data. Call after any admin change so the
 * public site updates immediately instead of waiting for ISR.
 */
export function revalidateProjectPages(): void {
  revalidatePath("/projects");
  revalidatePath("/");                 // home "Recent Projects." card
  revalidatePath("/admin", "layout");
}

/** JSON error response for the admin project API routes. */
export const projectErrorResponse = (error: unknown, context: string): NextResponse =>
  serviceErrorResponse(error, context, "Something went wrong saving the project.");
