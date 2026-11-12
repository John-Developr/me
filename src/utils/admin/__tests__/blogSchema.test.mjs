// Validation rules shared by the admin blog form and the admin API.
import { test } from "node:test";
import assert from "node:assert/strict";

import { blogInputSchema, blogGenerateSchema, parseBlogPatch } from "../blogSchema.ts";

const valid = {
  title:    "My Post",
  slug:     "my-post",
  category: "technology",
  excerpt:  "Short summary.",
  content:  "## Hello\n\nBody.",
};

test("minimal post defaults to a personal draft with no tags", () => {
  const r = blogInputSchema.parse(valid);
  assert.equal(r.status, "draft");
  assert.equal(r.source, "personal");
  assert.deepEqual(r.tags, []);
});

test("text is trimmed; tags drop blanks and duplicates", () => {
  const r = blogInputSchema.parse({ ...valid, title: "  Spaced  ", tags: ["react", " ", "react"] });
  assert.equal(r.title, "Spaced");
  assert.deepEqual(r.tags, ["react"]);
});

test("required fields, slug pattern and category are enforced", () => {
  for (const key of ["title", "excerpt", "content"]) {
    assert.equal(blogInputSchema.safeParse({ ...valid, [key]: "   " }).success, false, key);
  }
  for (const slug of ["My Post", "my--post", "-x", "x-"]) {
    assert.equal(blogInputSchema.safeParse({ ...valid, slug }).success, false, slug);
  }
  assert.equal(blogInputSchema.safeParse({ ...valid, category: "All" }).success, false);
  assert.equal(blogInputSchema.safeParse({ ...valid, status: "archived" }).success, false);
});

test("patch returns only the fields that were sent", () => {
  const r = parseBlogPatch({ status: "published" });
  assert.equal(r.success, true);
  assert.deepEqual(r.data, { status: "published" });
});

test("patch still validates the fields it gets", () => {
  assert.equal(parseBlogPatch({ slug: "Bad Slug" }).success, false);
});

test("generate needs a real category", () => {
  assert.equal(blogGenerateSchema.safeParse({ category: "life" }).success, true);
  assert.equal(blogGenerateSchema.safeParse({ category: "All" }).success, false);
  assert.equal(blogGenerateSchema.safeParse({}).success, false);
});
