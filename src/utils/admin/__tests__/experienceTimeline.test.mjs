// Home page "Experience." timeline: grouping, order, labels.
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildTimeline, formatDuration, monthsBetween, formatRange } from "../../experienceTimeline.ts";

const TODAY = new Date("2026-11-06T12:00:00Z");

// Same rows as supabase/migrations/20261109000100_experience_timeline.sql
const SEED = [
  { entry_type: "milestone", company: "Hello wordl!", position: "Wrote my first line of code", start_date: "2015-06-01", end_date: null, logo_url: "/images/company/CodeTag.png" },
  { entry_type: "work", company: "Proweaver, Inc.", position: "Full Stack Developer", start_date: "2021-07-01", end_date: "2023-07-01", logo_url: "/images/company/Proweaver.png" },
  { entry_type: "work", company: "Forty Degrees Celsius, Inc.", position: "Web Developer", start_date: "2023-07-01", end_date: "2024-01-01", logo_url: "/images/company/Forty.png" },
  { entry_type: "education", company: "University of Cebu - Main", position: "BS Information Technology", start_date: "2015-07-01", end_date: "2021-07-01", logo_url: "/images/company/UC.png" },
  { entry_type: "work", company: "Forty Degrees Celsius, Inc.", position: "AI Engineer", start_date: "2025-12-01", end_date: null, logo_url: "/images/company/Forty.png" },
  { entry_type: "work", company: "Forty Degrees Celsius, Inc.", position: "iOS Developer", start_date: "2024-01-01", end_date: null, logo_url: "/images/company/Forty.png" },
];

test("seed reproduces the labels the home page showed on 2026-11-06", () => {
  const t = buildTimeline(SEED, TODAY);

  assert.deepEqual(t.map((g) => g.company), ["Forty Degrees Celsius, Inc.", "Proweaver, Inc.", "University of Cebu - Main", "Hello wordl!"]);

  const forty = t[0];
  assert.equal(forty.dateLabel, "07 / 2023 - Present");
  assert.deepEqual(forty.roles.map((r) => [r.position, r.durationLabel]), [
    ["AI Engineer", "For 11 Months"],
    ["iOS Developer", "For 2 Years and 10 Months"],
    ["Web Developer", "For 6 Months"],
  ]);

  assert.equal(t[1].roles[0].dateLabel, "07 / 2021 - 07 / 2023");
  assert.equal(t[1].roles[0].durationLabel, null);
  assert.equal(t[2].roles[0].dateLabel, "07 / 2015 - 07 / 2021");
  assert.equal(t[3].roles[0].dateLabel, "06 / 2015");
});

test("company grouping ignores case and spacing", () => {
  const t = buildTimeline([
    { entry_type: "work", company: "Acme", position: "A", start_date: "2020-01-01", end_date: "2021-01-01", logo_url: null },
    { entry_type: "work", company: " acme ", position: "B", start_date: "2021-01-01", end_date: "2022-03-01", logo_url: "/l.png" },
  ], TODAY);
  assert.equal(t.length, 1);
  assert.equal(t[0].dateLabel, "01 / 2020 - 03 / 2022");
  assert.equal(t[0].logoUrl, "/l.png");
});

test("education entries at the same school are not merged", () => {
  const t = buildTimeline([
    { id: "1", entry_type: "education", company: "UC", position: "BS", start_date: "2015-01-01", end_date: "2019-01-01", logo_url: null },
    { id: "2", entry_type: "education", company: "UC", position: "MS", start_date: "2019-06-01", end_date: "2021-01-01", logo_url: null },
  ], TODAY);
  assert.equal(t.length, 2);
});

test("durations", () => {
  assert.equal(monthsBetween("2025-12-01", null, TODAY), 11);
  assert.equal(formatDuration(0), "Less than a month");
  assert.equal(formatDuration(1), "For 1 Month");
  assert.equal(formatDuration(12), "For 1 Year");
  assert.equal(formatDuration(25), "For 2 Years and 1 Month");
  assert.equal(formatRange({ entry_type: "work", start_date: "2020-02-01", end_date: null }), "02 / 2020 - Present");
});

// ─── Validation ──────────────────────────────────────────────
import { experienceInputSchema } from "../experienceSchema.ts";

const job = { entry_type: "work", company: "Acme", position: "Dev", start_date: "2024-01" };
const parse = (extra) => experienceInputSchema.safeParse({ ...job, ...extra });

test("months are stored as first-of-month; empty end = current", () => {
  const r = experienceInputSchema.parse({ ...job, end_date: "", employment_type: "Full-time" });
  assert.equal(r.start_date, "2024-01-01");
  assert.equal(r.end_date, null);
  assert.equal(r.employment_type, "Full-time");
});

test("date rules", () => {
  assert.equal(parse({ end_date: "2023-12" }).success, false);                       // before start
  assert.equal(parse({ start_date: "2999-01" }).success, false);                     // future
  assert.equal(parse({ start_date: "2024-13" }).success, false);                     // bad month
  assert.equal(parse({ entry_type: "milestone", end_date: "2024-05" }).success, false); // milestone has one date
  assert.equal(parse({ end_date: "2024-06" }).success, true);
});

test("employment type is dropped for non-work entries", () => {
  const r = experienceInputSchema.parse({ ...job, entry_type: "education", employment_type: "Full-time" });
  assert.equal(r.employment_type, null);
  assert.equal(parse({ employment_type: "Gig" }).success, false);
});
