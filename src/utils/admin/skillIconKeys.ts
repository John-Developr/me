/** Icon keys a skill category can use (CHECK constraint on skill_categories.icon). */
export const SKILL_ICON_KEYS = [
  "category", "settings", "phone", "document", "sync", "chat", "edit", "link", "lock", "briefcase", "star",
] as const;

export type SkillIconKey = (typeof SKILL_ICON_KEYS)[number];
