import { revalidatePath } from "next/cache";

/**
 * Pages that show blog posts. Call after any admin change so the
 * public site updates immediately instead of waiting for ISR.
 */
export function revalidateBlogPages(): void {
  revalidatePath("/blog", "layout");   // list + every /blog/[slug] page and share image
  revalidatePath("/");                 // home "Recent Blog." card
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin", "layout");
}
