import { revalidatePath } from "next/cache";

/**
 * Skills show on /tech-stack, the home Tech Stack card, and as tech logos on
 * project chips across the site: refresh everything after a change.
 */
export function revalidateSkillPages(): void {
  revalidatePath("/", "layout");
}
