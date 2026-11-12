import { z } from "zod";

// Type-only: tests load this file with Node's type stripping, which can't run types.ts (enums).
import type { ContactMessage, MessagePreview, MessageStatus } from "@/utils/types";

/* ============================================================
   CONTACT MESSAGES
   ------------------------------------------------------------
   Status changes for the Contact Messages inbox, plus small
   helpers shared by the inbox and the notification bell.
   ============================================================ */

export const MESSAGE_STATUSES = ["new", "read", "archived"] as const satisfies readonly MessageStatus[];

/** Body of PATCH /api/admin/messages/[id]. */
export const messageStatusSchema = z.object({
  status: z.enum(MESSAGE_STATUSES, "Status must be new, read or archived."),
});

/** "Jane Doe", else the email address (names are optional on the form). */
export const senderName = (m: Pick<MessagePreview, "first_name" | "last_name" | "email">): string =>
  [m.first_name, m.last_name].map((part) => part?.trim()).filter(Boolean).join(" ") || m.email;

/** mailto: link that replies to the sender with "Re: <subject>". */
export function replyMailto(m: Pick<ContactMessage, "email" | "subject">): string {
  const subject = m.subject.trim();
  const reply   = /^re:/i.test(subject) ? subject : `Re: ${subject}`;
  return `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(reply)}`;
}

/** Case-insensitive search over sender, email, subject, inquiry type and message. */
export function matchesMessage(m: ContactMessage, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [m.first_name, m.last_name, m.email, m.subject, m.inquiry_type, m.message]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(q);
}
