import { unstable_cache } from "next/cache";

import { getPublicProfile } from "@/app/getPublicProfile";
import { getPublicSkills } from "@/app/getPublicSkills";
import { getPublicProjects } from "@/app/projects/getProjects";
import BlogService from "@/lib/.services/blogService";
import { CHAT_KNOWLEDGE_TAG } from "@/lib/.services/chatRouteHelpers";
import ExperienceService from "@/lib/.services/experienceService";
import ProfileService from "@/lib/.services/profileService";
import { BASE_URL } from "@/config/siteUrl";
import { buildChatKnowledge } from "@/utils/chatKnowledge";
import { ChatKnowledgeSource } from "@/utils/types";

/** Most blog posts the chat knows about (title + excerpt each). */
const CHAT_BLOG_LIMIT = 30;

/**
 * Safety net (seconds) for edits made outside the admin, e.g. directly in
 * Supabase. Admin saves clear the cache right away via revalidateChatKnowledge().
 */
const CHAT_KNOWLEDGE_TTL = 3600;

/**
 * The raw data behind the chat's knowledge, cached across requests under
 * CHAT_KNOWLEDGE_TAG. Only the data is cached, not the formatted text, so
 * "Today's date" and the computed age stay current.
 * Bump the version key whenever ChatKnowledgeSource changes shape, so a
 * cached entry from an older deploy is never read.
 * Errors are not cached: a failed load is retried on the next message.
 */
const loadChatKnowledgeSource = unstable_cache(
  async (): Promise<ChatKnowledgeSource> => {
    const [profile, personal, experience, skills, { featured, projects }, posts] = await Promise.all([
      getPublicProfile(),
      ProfileService.getChatPersonal(),
      ExperienceService.getChatEntries(),
      getPublicSkills(),
      getPublicProjects(),
      new BlogService().getChatIndex(CHAT_BLOG_LIMIT),
    ]);

    return { profile, personal, experience, skills, featured, projects, posts };
  },
  ["chat-knowledge", "v1"],
  { tags: [CHAT_KNOWLEDGE_TAG], revalidate: CHAT_KNOWLEDGE_TTL },
);

/**
 * The chat assistant's KNOWLEDGE block: live profile (+ personal details), experience, skills,
 * projects and published blog posts. Served from cache; admin edits clear it
 * (revalidateChatKnowledge), so they still show up in the next reply.
 *
 * Throws on database errors: the chat route then answers "Unable to reply
 * right now." instead of replying without grounding.
 */
export async function getChatKnowledge(): Promise<string> {
  return buildChatKnowledge(await loadChatKnowledgeSource(), new Date(), BASE_URL);
}
