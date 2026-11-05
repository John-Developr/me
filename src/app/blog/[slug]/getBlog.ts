import { cache } from "react";

import BlogService from "@/lib/.services/blogService";
import { AIBlogResponse } from "@/utils/types";

/**
 * Loads a post for server rendering, deduplicated per request
 * (shared by generateMetadata and the page).
 *
 * @returns The post; `null` if the slug doesn't exist;
 *          `undefined` on a database error (the client then retries via the API).
 */
export const getBlog = cache(async (slug: string): Promise<AIBlogResponse | null | undefined> => {
  try {
    return await new BlogService().getBySlug(slug);
  } catch {
    return undefined;
  }
});
