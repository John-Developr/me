import { getPublicProfile } from "@/app/getPublicProfile";
import { getPublicSkills } from "@/app/getPublicSkills";
import { getPublicProjects } from "@/app/projects/getProjects";
import BlogService from "@/lib/.services/blogService";
import ExperienceService from "@/lib/.services/experienceService";
import ProfileService from "@/lib/.services/profileService";
import { BASE_URL } from "@/config/siteUrl";
import { buildChatKnowledge } from "@/utils/chatKnowledge";

/** Most blog posts the chat knows about (title + excerpt each). */
const CHAT_BLOG_LIMIT = 30;

/**
 * The chat assistant's KNOWLEDGE block: live profile (+ personal details), experience, skills,
 * projects and published blog posts, read fresh on every message so admin
 * edits show up in the next reply.
 *
 * Throws on database errors: the chat route then answers "Unable to reply
 * right now." instead of replying without grounding.
 */
export async function getChatKnowledge(): Promise<string> {
  const [profile, personal, experience, skills, { featured, projects }, posts] = await Promise.all([
    getPublicProfile(),
    ProfileService.getChatPersonal(),
    ExperienceService.getChatEntries(),
    getPublicSkills(),
    getPublicProjects(),
    new BlogService().getChatIndex(CHAT_BLOG_LIMIT),
  ]);

  return buildChatKnowledge({ profile, personal, experience, skills, featured, projects, posts }, new Date(), BASE_URL);
}
