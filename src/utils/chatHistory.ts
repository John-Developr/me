import { z } from "zod";

import type { Message } from "@/utils/types";

/* ============================================================
   CHAT HISTORY (cookie)
   ------------------------------------------------------------
   The chat keeps its conversation in one httpOnly cookie.
   - parseHistory: the cookie is visitor-controlled, so it is
     validated; anything malformed counts as "no history".
   - fitHistory: browsers silently drop a cookie over ~4 KB, so
     the oldest turns are dropped until the encoded cookie fits.
     The conversation never hits a hard "limit"; it just
     forgets its oldest messages.
   Pure functions, tested in __tests__/chatHistory.test.mjs.
   ============================================================ */

/** Max bytes for `name=value` (encoded), leaving room under the ~4096-byte limit. */
export const HISTORY_COOKIE_BUDGET = 3800;

/** Hard cap on stored messages, whatever their size. */
const MAX_MESSAGES = 40;

const historySchema = z.array(
  z.object({
    role:  z.enum(["user", "model"]),
    parts: z.array(z.object({ text: z.string() })).min(1),
  }),
).max(MAX_MESSAGES);

/** Cookie value → history; malformed or tampered values become []. */
export function parseHistory(raw: string | undefined): Message[] {
  if (!raw) return [];
  try {
    const parsed = historySchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

/** Size of `name=value` as sent (Next encodes the value with encodeURIComponent, which is ASCII). */
export const cookieBytes = (name: string, history: Message[]): number =>
  name.length + 1 + encodeURIComponent(JSON.stringify(history)).length;

/**
 * Newest turns that fit in the cookie. Drops whole user/model pairs from the
 * start, so the history always begins with a visitor message.
 *
 * @returns [] when even the latest pair is too big
 */
export function fitHistory(history: Message[], name: string, budget: number = HISTORY_COOKIE_BUDGET): Message[] {
  let start = Math.max(0, history.length - MAX_MESSAGES);

  while (start < history.length) {
    if (history[start].role !== "user") { start++; continue; }
    if (cookieBytes(name, history.slice(start)) <= budget) return history.slice(start);
    start += 2;
  }

  return [];
}
