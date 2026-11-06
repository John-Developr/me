// Skills & Technologies validation.
import { test } from "node:test";
import assert from "node:assert/strict";

import { categoryInputSchema, categorySlug, skillInputSchema } from "../skillSchema.ts";

const UUID = "11111111-1111-4111-8111-111111111111";

test("a skill needs a name; category is optional", () => {
  const r = skillInputSchema.parse({ name: "  Swift ", category_id: "" });
  assert.equal(r.name, "Swift");
  assert.equal(r.category_id, null);
  assert.equal(r.is_core, false);
  assert.equal(skillInputSchema.safeParse({ name: "" }).success, false);
  assert.equal(skillInputSchema.safeParse({ name: "X", category_id: "not-a-uuid" }).success, false);
  assert.equal(skillInputSchema.parse({ name: "X", category_id: UUID }).category_id, UUID);
});

test("core tools need a description (max 160)", () => {
  assert.equal(skillInputSchema.safeParse({ name: "Next.js", category_id: null, is_core: true }).success, false);
  assert.equal(skillInputSchema.safeParse({ name: "Next.js", category_id: null, is_core: true, description: "x".repeat(161) }).success, false);
  assert.equal(skillInputSchema.safeParse({ name: "Next.js", category_id: null, is_core: true, description: "React framework." }).success, true);
});

test("logos must be Media Library files or site paths", () => {
  assert.equal(skillInputSchema.safeParse({ name: "X", category_id: null, logo_url: "https://evil.com/x.png" }).success, false);
  assert.equal(skillInputSchema.safeParse({ name: "X", category_id: null, logo_url: "/images/tech/next.png" }).success, true);
});

test("category slugs and icons", () => {
  assert.equal(categorySlug("Cloud & DevOps"), "cloud-devops");
  assert.equal(categorySlug("AI & Machine Learning"), "ai-machine-learning");
  assert.equal(categorySlug("APIs & Integrations"), "apis-integrations");
  const c = categoryInputSchema.parse({ name: "Mobile", icon: "phone" });
  assert.equal(c.slug, "mobile");
  assert.equal(categoryInputSchema.safeParse({ name: "X", icon: "rocket" }).success, false);
});
