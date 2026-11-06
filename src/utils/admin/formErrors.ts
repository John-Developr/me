import type { ZodError } from "zod";

/** Flattens zod issues to `{ field: firstMessage }` for admin forms. */
export function toFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }

  return errors;
}
