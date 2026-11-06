import { cache } from "react";

import SkillService from "@/lib/.services/skillService";
import { PublicSkills } from "@/utils/types";

export const EMPTY_SKILLS: PublicSkills = { core: [], categories: [], current: [], logos: {} };

/**
 * Skills & Technologies for the public site, managed in /admin/skills:
 * Core Stack (also the home Tech Stack card), the Full Toolkit categories,
 * "Right Now" tools, and a name → logo map for tech chips.
 *
 * Throws on database errors: pages are ISR, so a failed refresh keeps the
 * last good page.
 */
export const getPublicSkills = cache(async (): Promise<PublicSkills> => {
  const { categories, skills } = await SkillService.getPublic();

  const logos: Record<string, string> = {};
  for (const skill of skills) {
    if (skill.logo_url && !logos[skill.name]) logos[skill.name] = skill.logo_url;
  }

  return {
    core: skills
      .filter((s) => s.is_core)
      .sort((a, b) => a.core_order - b.core_order || a.name.localeCompare(b.name))
      .map((s) => ({ name: s.name, description: s.description ?? "", logo: s.logo_url })),

    categories: categories.map((c) => ({
      slug:        c.slug,
      title:       c.name,
      description: c.description ?? "",
      iconKey:     c.icon,
      items:       skills.filter((s) => s.category_id === c.id).map((s) => s.name),
    })),

    current: [...new Set(skills.filter((s) => s.is_current).map((s) => s.name))],
    logos,
  };
});
