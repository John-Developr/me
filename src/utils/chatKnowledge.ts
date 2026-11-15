import type { ChatExperienceEntry, ChatKnowledgeSource, ProjectItem } from "@/utils/types";
import { formatRange } from "@/utils/experienceTimeline";

/* ============================================================
   CHAT KNOWLEDGE (the "retrieval" half of the chat's RAG)
   ------------------------------------------------------------
   Turns live portfolio data (profile, personal details, experience, skills,
   projects, blog index) into one markdown "KNOWLEDGE" block that
   is appended to the chat system instruction on every message.
   Empty fields are left out so the model never sees blanks it
   could fill in by guessing.
   Pure functions — `today` and `baseUrl` are passed in for
   stable output/tests.
   ============================================================ */

/** Heading the system instruction refers to; keep in sync with src/docs/system-instruction.md. */
export const KNOWLEDGE_HEADING = "# KNOWLEDGE";

const ENTRY_LABEL: Record<ChatExperienceEntry["entry_type"], string> = {
  work:      "Work",
  education: "Education",
  milestone: "Milestone",
};

/** Trimmed text, or null when empty. */
const clean = (value: string | null | undefined): string | null => value?.trim() || null;

/** "- Label: value" lines for the values that are set. */
function fields(pairs: [string, string | null | undefined][]): string[] {
  return pairs
    .map(([label, value]) => [label, clean(value)] as const)
    .filter(([, value]) => value !== null)
    .map(([label, value]) => `- ${label}: ${value}`);
}

/** Joins non-empty blocks with one blank line. */
const section = (title: string, blocks: string[]): string =>
  [`## ${title}`, ...(blocks.length ? blocks : ["(none listed)"])].join("\n\n");

function profileSection({ profile }: ChatKnowledgeSource): string {
  const lines = fields([
    ["Name",                 profile.name],
    ["Headline",             profile.headline],
    ["Location",             profile.location],
    ["Email",                profile.email],
    ["Phone",                profile.phone],
    ["Schedule a call",      profile.bookingUrl],
    ["Resume",               profile.resumeUrl],
    ["LinkedIn",             profile.socials.linkedin],
    ["GitHub",               profile.socials.github],
    ["Facebook",             profile.socials.facebook],
    ["Instagram",            profile.socials.instagram],
    ["X",                    profile.socials.x],
    ["Website",              profile.socials.website],
  ]);

  const bio = profile.bio.map((p) => p.trim()).filter(Boolean);
  return section("Profile", [lines.join("\n"), ...bio].filter(Boolean));
}

/** Whole years from a "YYYY-MM-DD" birthdate to `today` (UTC). */
export function ageOn(birthdate: string, today: Date): number {
  const [year, month, day] = birthdate.split("-").map(Number);
  const beforeBirthday =
    today.getUTCMonth() + 1 < month ||
    (today.getUTCMonth() + 1 === month && today.getUTCDate() < day);
  return today.getUTCFullYear() - year - (beforeBirthday ? 1 : 0);
}

function personalSection({ personal }: ChatKnowledgeSource, today: Date): string {
  const birthdate = clean(personal.birthdate);
  const lines = fields([
    ["Birthdate",    birthdate ? `${birthdate} (age ${ageOn(birthdate, today)})` : null],
    ["Civil status", personal.civil_status],
  ]);

  return section("Personal details (share only when asked)", lines.length ? [lines.join("\n")] : []);
}

function experienceSection({ experience }: ChatKnowledgeSource): string {
  const blocks = experience.map((entry) => {
    const meta = [ENTRY_LABEL[entry.entry_type], clean(entry.employment_type), clean(entry.location)]
      .filter(Boolean)
      .join(", ");

    return [
      `### ${entry.position.trim()} — ${entry.company.trim()}`,
      `${meta} · ${formatRange(entry)}`,
      clean(entry.description),
    ].filter(Boolean).join("\n");
  });

  return section("Experience (newest first; \"Present\" means current)", blocks);
}

function skillsSection({ skills }: ChatKnowledgeSource): string {
  const blocks: string[] = [];

  if (skills.core.length) {
    blocks.push(["### Core stack", ...skills.core.map((tool) =>
      tool.description.trim() ? `- ${tool.name}: ${tool.description.trim()}` : `- ${tool.name}`
    )].join("\n"));
  }

  for (const category of skills.categories) {
    if (!category.items.length) continue;
    blocks.push([
      `### ${category.title}`,
      clean(category.description),
      category.items.join(", "),
    ].filter(Boolean).join("\n"));
  }

  if (skills.current.length) {
    blocks.push(`### Using right now\n${skills.current.join(", ")}`);
  }

  return section("Skills & Technologies", blocks);
}

function projectBlock(project: ProjectItem, isFeatured: boolean): string {
  const lines = [
    `### ${project.name.trim()}${isFeatured ? " (featured)" : ""}`,
    clean(project.tagline),
    ...fields([
      ["Type",         project.kind],
      ["Role",         project.role],
      ["Organization", project.organization],
      ["Period",       project.period],
    ]),
    clean(project.description),
    ...project.highlights.map((h) => h.trim()).filter(Boolean).map((h) => `- ${h}`),
    project.tech.length ? `Tech: ${project.tech.join(", ")}` : null,
    ...project.links.map((link) => `${link.label}: ${link.href}`),
    clean(project.note),
  ];

  return lines.filter(Boolean).join("\n");
}

function projectsSection(source: ChatKnowledgeSource, baseUrl: string): string {
  const blocks = [
    ...(source.featured ? [projectBlock(source.featured, true)] : []),
    ...source.projects.map((project) => projectBlock(project, false)),
  ];

  return section(`Projects (all listed at ${baseUrl}/projects)`, blocks);
}

function blogSection({ posts }: ChatKnowledgeSource, baseUrl: string): string {
  const blocks = posts.map((post) => {
    const meta = [post.category ? String(post.category) : null, post.generated_at.slice(0, 10)].filter(Boolean).join(", ");
    const url  = post.slug ? `${baseUrl}/blog/${post.slug}` : `${baseUrl}/blog`;

    return [
      `- [${post.title.trim()}](${url}) (${meta})`,
      clean(post.excerpt) ? `  ${clean(post.excerpt)}` : null,
      post.tags.length ? `  Tags: ${post.tags.join(", ")}` : null,
    ].filter(Boolean).join("\n");
  });

  return section(`Blog posts (newest first; all at ${baseUrl}/blog)`, blocks);
}

/**
 * Builds the KNOWLEDGE block for the chat system instruction.
 *
 * @param source  - Live data from the public loaders
 * @param today   - Used for "Today's date" (age, "how long" questions)
 * @param baseUrl - Site origin without a trailing slash, for links
 */
export function buildChatKnowledge(source: ChatKnowledgeSource, today: Date, baseUrl: string): string {
  return [
    KNOWLEDGE_HEADING,
    `Live data from John's portfolio. Today's date: ${today.toISOString().slice(0, 10)}. Contact page: ${baseUrl}/contact`,
    profileSection(source),
    personalSection(source, today),
    experienceSection(source),
    skillsSection(source),
    projectsSection(source, baseUrl),
    blogSection(source, baseUrl),
  ].join("\n\n");
}
