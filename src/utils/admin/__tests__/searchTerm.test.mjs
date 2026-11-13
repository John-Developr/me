// Admin topbar search: query → safe ilike term.
import { test } from "node:test";
import assert from "node:assert/strict";

import { SEARCH_MAX_LENGTH, toSearchTerm } from "../searchTerm.ts";

test("keeps plain text and trims spaces", () => {
  assert.equal(toSearchTerm("  Next.js   portfolio "), "Next.js portfolio");
});

test("strips ilike wildcards and PostgREST filter separators", () => {
  assert.equal(toSearchTerm("a%b_c\\d*e"), "a b c d e");
  assert.equal(toSearchTerm("x,status.eq.draft)"), "x status.eq.draft");
  assert.equal(toSearchTerm('say "hi" (now)'), "say hi now");
});

test("returns empty for queries that are too short", () => {
  assert.equal(toSearchTerm(""), "");
  assert.equal(toSearchTerm("a"), "");
  assert.equal(toSearchTerm("%%%"), "");
});

test("caps the length", () => {
  assert.equal(toSearchTerm("x".repeat(200)).length, SEARCH_MAX_LENGTH);
});
