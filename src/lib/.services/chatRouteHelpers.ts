import { revalidateTag } from "next/cache";

/**
 * Cache tag for the chat assistant's knowledge (app/getChatKnowledge.ts).
 * The data behind it is cached across requests and cleared by
 * `revalidateChatKnowledge()` whenever that data changes.
 */
export const CHAT_KNOWLEDGE_TAG = "chat-knowledge";

/**
 * Clears the cached chat knowledge so the next message reloads it.
 * Call after any write to data the chat reads: profile (incl. personal
 * details), experience, skills, projects, blog posts, media import.
 * (The blog, project and skill `revalidate…Pages` helpers already call it.)
 */
export function revalidateChatKnowledge(): void {
  revalidateTag(CHAT_KNOWLEDGE_TAG);
}
