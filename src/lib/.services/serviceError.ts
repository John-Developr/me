import { NextResponse } from "next/server";

/**
 * Error thrown by admin services: an HTTP status, a message an admin can
 * act on, and optionally the form field it belongs to.
 */
export class ServiceError extends Error {
  constructor(message: string, public status: number, public field?: string) {
    super(message);
    this.name = "ServiceError";
  }
}

/**
 * JSON error response for admin API routes. ServiceErrors keep their status,
 * message and field; anything else is logged and becomes a generic 500.
 *
 * @param context - Route label for the server log, e.g. "api/admin/projects POST"
 */
export function serviceErrorResponse(error: unknown, context: string, fallback = "Something went wrong. Please try again."): NextResponse {
  if (error instanceof ServiceError) {
    return NextResponse.json(
      { message: error.message, errors: error.field ? { [error.field]: error.message } : undefined, result: false },
      { status: error.status }
    );
  }

  console.error(`[${context}] failed:`, error);
  return NextResponse.json({ message: fallback, result: false }, { status: 500 });
}
