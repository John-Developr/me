// Skills & Technologies validation.
import { test } from "node:test";
import assert from "node:assert/strict";

process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://demo.supabase.co";
const { categoryInputSchema, categorySlug, coreOrderSchema, skillInputSchema } = await import("../skillSchema.ts");
const MEDIA = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/`;

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

test("logos must come from the Media Library (no local /public paths)", () => {
  const logo = (logo_url) => skillInputSchema.safeParse({ name: "X", category_id: null, logo_url }).success;
  assert.equal(logo(`${MEDIA}2026/11/next.png`), true);
  assert.equal(logo(""), true); // no logo
  assert.equal(logo("/images/tech/next.png"), false);
  assert.equal(logo("https://evil.com/x.png"), false);
  assert.equal(logo(`${MEDIA}../secret.png`), false);
});

test("category slugs and icons", () => {
  assert.equal(categorySlug("Cloud & DevOps"), "cloud-devops");
  assert.equal(categorySlug("AI & Machine Learning"), "ai-machine-learning");
  assert.equal(categorySlug("APIs & Integrations"), "apis-integrations");
  const c = categoryInputSchema.parse({ name: "Mobile", icon: "phone" });
  assert.equal(c.slug, "mobile");
  assert.equal(categoryInputSchema.safeParse({ name: "X", icon: "rocket" }).success, false);
});

test("core order takes unique skill ids", () => {
  const OTHER = "22222222-2222-4222-8222-222222222222";
  assert.deepEqual(coreOrderSchema.parse({ ids: [OTHER, UUID] }).ids, [OTHER, UUID]);
  assert.equal(coreOrderSchema.safeParse({ ids: [] }).success, false);
  assert.equal(coreOrderSchema.safeParse({ ids: [UUID, UUID] }).success, false);
  assert.equal(coreOrderSchema.safeParse({ ids: ["nope"] }).success, false);
  assert.equal(coreOrderSchema.safeParse({}).success, false);
});
