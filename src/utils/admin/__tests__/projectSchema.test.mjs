// Validation rules shared by the project form and the admin API.
import { test } from "node:test";
import assert from "node:assert/strict";

import { projectInputSchema, parseProjectPatch } from "../projectSchema.ts";
import { toFieldErrors } from "../formErrors.ts";

const valid = { title: "My Project", slug: "my-project" };

test("minimal project gets safe defaults and nulls for empty fields", () => {
  const r = projectInputSchema.parse({ ...valid, tagline: "  ", kind: null });
  assert.equal(r.tagline, null);
  assert.equal(r.kind, null);
  assert.equal(r.status, "draft");
  assert.equal(r.is_featured, false);
  assert.deepEqual(r.highlights, []);
  assert.equal(r.sort_order, 0);
});

test("text is trimmed; highlights/tech drop blanks and duplicates", () => {
  const r = projectInputSchema.parse({ ...valid, title: "  Spaced  ", highlights: ["a", " ", "a"], tech: ["React", "React"] });
  assert.equal(r.title, "Spaced");
  assert.deepEqual(r.highlights, ["a"]);
  assert.deepEqual(r.tech, ["React"]);
});

test("slug must match the database pattern", () => {
  for (const slug of ["My Project", "my--project", "-x", "x-", "ünï"]) {
    assert.equal(projectInputSchema.safeParse({ ...valid, slug }).success, false, slug);
  }
  assert.equal(projectInputSchema.safeParse({ ...valid, slug: "covid-tracker-2" }).success, true);
});

test("links must be http(s); images must be site paths", () => {
  const bad = [
    { live_url: "javascript:alert(1)" },
    { source_url: "github.com/x" },
    { logo_url: "https://cdn.example.com/x.png" },
    { logo_url: "//evil.com/x.png" },
    { image_url: "/images/../../etc/passwd" },
  ];
  for (const extra of bad) {
    assert.equal(projectInputSchema.safeParse({ ...valid, ...extra }).success, false, JSON.stringify(extra));
  }
  const ok = projectInputSchema.parse({ ...valid, live_url: "https://nativecamp.net", logo_url: "/images/NativeCamp.png" });
  assert.equal(ok.logo_url, "/images/NativeCamp.png");
});

test("limits: highlights, tech, kind, order", () => {
  assert.equal(projectInputSchema.safeParse({ ...valid, highlights: Array(7).fill("x").map((x, i) => x + i) }).success, false);
  assert.equal(projectInputSchema.safeParse({ ...valid, tech: Array(21).fill(0).map((_, i) => "t" + i) }).success, false);
  assert.equal(projectInputSchema.safeParse({ ...valid, kind: "Hobby" }).success, false);
  assert.equal(projectInputSchema.safeParse({ ...valid, sort_order: 1.5 }).success, false);
  assert.equal(projectInputSchema.safeParse({ ...valid, sort_order: -1 }).success, false);
});

test("field errors are keyed by field", () => {
  const r = projectInputSchema.safeParse({ title: "", slug: "Bad Slug" });
  const errors = toFieldErrors(r.error);
  assert.ok(errors.title);
  assert.ok(errors.slug);
});

test("PATCH keeps only the fields sent (no defaults leak in)", () => {
  const r = parseProjectPatch({ status: "published" });
  assert.deepEqual(r.data, { status: "published" });

  const f = parseProjectPatch({ is_featured: true, unknown: "ignored" });
  assert.deepEqual(f.data, { is_featured: true });

  assert.equal(parseProjectPatch({ status: "live" }).success, false);
  assert.deepEqual(parseProjectPatch(null).data ?? {}, {});
});
