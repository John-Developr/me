// /projects "More Projects." sort: start year from the period text.
import { test } from "node:test";
import assert from "node:assert/strict";

import { projectStartYear, sortProjectsByYear } from "../projectSort.ts";

test("reads the first 4-digit year from the period", () => {
  assert.equal(projectStartYear("2023 – Present"), 2023);
  assert.equal(projectStartYear("Jan 2021 – Mar 2022"), 2021);
  assert.equal(projectStartYear("2026"), 2026);
  assert.equal(projectStartYear("Ongoing"), null);
  assert.equal(projectStartYear(undefined), null);
  assert.equal(projectStartYear("v12345"), null);
});

const list = [
  { name: "a", period: "2021" },
  { name: "b", period: undefined },
  { name: "c", period: "2023 – Present" },
  { name: "d", period: "2021 – 2022" },
  { name: "e", period: "2026" },
];
const names = (items) => items.map((p) => p.name).join("");

test("newest first; same year keeps display order; no year last", () => {
  assert.equal(names(sortProjectsByYear(list, false)), "ecadb");
});

test("oldest first; no year still last", () => {
  assert.equal(names(sortProjectsByYear(list, true)), "adceb");
});

test("does not mutate the input", () => {
  const copy = [...list];
  sortProjectsByYear(list, true);
  assert.deepEqual(list, copy);
});
