// Chat KNOWLEDGE block: what the chat assistant is grounded in.
import { test } from "node:test";
import assert from "node:assert/strict";

import { ageOn, buildChatKnowledge, KNOWLEDGE_HEADING } from "../chatKnowledge.ts";

const TODAY = new Date("2026-11-15T08:00:00Z");
const BASE  = "https://example.com";

const EMPTY = {
  profile: {
    name: "", headline: null, location: null, avatarUrl: null, bio: [], email: null, phone: null,
    resumeUrl: null, bookingUrl: null,
    socials: { linkedin: null, github: null, facebook: null, instagram: null, x: null, website: null },
  },
  personal:   { birthdate: null, civil_status: null },
  experience: [],
  skills:     { core: [], categories: [], current: [], logos: {} },
  featured:   null,
  projects:   [],
  posts:      [],
};

const FULL = {
  ...EMPTY,
  profile: {
    ...EMPTY.profile,
    name: "John Carlo A. Ylanan", headline: "Full Stack Developer", email: "john@example.com",
    bio: ["First paragraph.", "  "],
    socials: { ...EMPTY.profile.socials, github: "https://github.com/john" },
  },
  experience: [
    { entry_type: "work", company: "Forty Degrees Celsius, Inc.", position: "AI Engineer", employment_type: "Full-time",
      location: null, start_date: "2025-12-01", end_date: null, description: "- Builds AI features" },
    { entry_type: "milestone", company: "Hello wordl!", position: "Wrote my first line of code", employment_type: null,
      location: null, start_date: "2015-06-01", end_date: null, description: null },
  ],
  skills: {
    core:       [{ name: "Next.js", description: "App Router", logo: null }, { name: "Swift", description: "", logo: null }],
    categories: [
      { slug: "fe", title: "Frontend", description: "UI work", iconKey: "frontend", items: ["React", "Vue"] },
      { slug: "empty", title: "Empty Category", description: "", iconKey: "frontend", items: [] },
    ],
    current: ["Gemini"],
    logos:   {},
  },
  featured: {
    slug: "cms", name: "Portfolio CMS", tagline: "Admin for this site", role: "Solo developer", description: "Built it.",
    highlights: ["Supabase RLS"], tech: ["Next.js"], links: [{ kind: "live", label: "Open Live Site", href: "https://example.com" }],
  },
  projects: [{ slug: "app", name: "Side App", tagline: "", description: "", highlights: [], tech: [], links: [], note: "Private client work" }],
  posts: [{ title: "Hello RAG", slug: "hello-rag", category: "technology", excerpt: "Why grounding matters.", tags: ["ai"], generated_at: "2026-11-01T00:00:00Z" }],
};

test("starts with the heading the system instruction refers to, plus today's date and contact link", () => {
  const out = buildChatKnowledge(EMPTY, TODAY, BASE);
  assert.ok(out.startsWith(KNOWLEDGE_HEADING));
  assert.match(out, /Today's date: 2026-11-15/);
  assert.match(out, /Contact page: https:\/\/example\.com\/contact/);
});

test("empty data says so instead of leaving blanks to guess", () => {
  const out = buildChatKnowledge(EMPTY, TODAY, BASE);
  for (const title of ["Profile", "Personal details", "Experience", "Skills & Technologies", "Projects", "Blog posts"]) {
    assert.match(out, new RegExp(`## ${title}[^\\n]*\\n\\n\\(none listed\\)`));
  }
  assert.doesNotMatch(out, /null|undefined/);
});

test("profile lists only the fields that are set", () => {
  const out = buildChatKnowledge(FULL, TODAY, BASE);
  assert.match(out, /- Name: John Carlo A\. Ylanan/);
  assert.match(out, /- GitHub: https:\/\/github\.com\/john/);
  assert.match(out, /First paragraph\./);
  assert.doesNotMatch(out, /- Phone:/);
  assert.doesNotMatch(out, /- LinkedIn:/);
});

test("experience shows type, dates (Present for current) and description", () => {
  const out = buildChatKnowledge(FULL, TODAY, BASE);
  assert.match(out, /### AI Engineer — Forty Degrees Celsius, Inc\.\nWork, Full-time · 12 \/ 2025 - Present\n- Builds AI features/);
  assert.match(out, /### Wrote my first line of code — Hello wordl!\nMilestone · 06 \/ 2015/);
});

test("skills: core with descriptions, non-empty categories, current tools", () => {
  const out = buildChatKnowledge(FULL, TODAY, BASE);
  assert.match(out, /- Next\.js: App Router\n- Swift\n/);
  assert.match(out, /### Frontend\nUI work\nReact, Vue/);
  assert.doesNotMatch(out, /Empty Category/);
  assert.match(out, /### Using right now\nGemini/);
});

test("projects: featured first with details and links; note when there are no links", () => {
  const out = buildChatKnowledge(FULL, TODAY, BASE);
  assert.ok(out.indexOf("### Portfolio CMS (featured)") < out.indexOf("### Side App"));
  assert.match(out, /- Role: Solo developer/);
  assert.match(out, /- Supabase RLS\nTech: Next\.js\nOpen Live Site: https:\/\/example\.com/);
  assert.match(out, /### Side App\nPrivate client work/);
});

test("blog posts link to their page with category and date", () => {
  const out = buildChatKnowledge(FULL, TODAY, BASE);
  assert.match(out, /- \[Hello RAG\]\(https:\/\/example\.com\/blog\/hello-rag\) \(technology, 2026-11-01\)\n  Why grounding matters\.\n  Tags: ai/);
});

test("personal details show birthdate with computed age and civil status", () => {
  const out = buildChatKnowledge({ ...FULL, personal: { birthdate: "1999-07-14", civil_status: "Single" } }, TODAY, BASE);
  assert.match(out, /## Personal details \(share only when asked\)\n\n- Birthdate: 1999-07-14 \(age 27\)\n- Civil status: Single/);
});

test("age counts whole years and changes on the birthday", () => {
  assert.equal(ageOn("1999-07-14", new Date("2026-07-13T23:59:00Z")), 26);
  assert.equal(ageOn("1999-07-14", new Date("2026-07-14T00:00:00Z")), 27);
  assert.equal(ageOn("2000-02-29", new Date("2026-02-28T12:00:00Z")), 25);
  assert.equal(ageOn("2000-02-29", new Date("2026-03-01T12:00:00Z")), 26);
});
