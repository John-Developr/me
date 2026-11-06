// Unit tests for the admin dashboard's pure logic.
// Run with `npm test` (Node's built-in runner; Node ≥ 22.18 strips TS types natively).
import { test } from "node:test";
import assert from "node:assert/strict";

import { getProfileCompletion, PROFILE_COMPLETION_RULES, MIN_BIO_LENGTH } from "../profileCompletion.ts";
import { parseRangeParams, presetToRange, previousRange, enumerateDays, rangeLength, parseIsoDay } from "../dateRange.ts";
import { niceMax, yTicks, toChartPoints, nearestIndex, labelIndexes, linePath } from "../chartScale.ts";
import { percentChange, formatRelative } from "../format.ts";
import { safeAdminRedirect } from "../safeRedirect.ts";

const NOW = new Date("2026-11-06T15:30:00Z");

const emptyProfile = {
  full_name: null, headline: null, bio: null, avatar_url: null, email: null,
  location: null, resume_url: null, github_url: null, linkedin_url: null,
  updated_at: "2026-11-01T00:00:00Z",
};

// ─── Profile completion ───────────────────────────────────────

test("profile completion: no profile row is 0% with every rule missing", () => {
  const result = getProfileCompletion(null);
  assert.equal(result.percent, 0);
  assert.equal(result.exists, false);
  assert.equal(result.missing.length, PROFILE_COMPLETION_RULES.length);
});

test("profile completion: whitespace-only fields don't count", () => {
  const result = getProfileCompletion({ ...emptyProfile, full_name: "   ", headline: "\n" });
  assert.equal(result.percent, 0);
  assert.equal(result.exists, true);
});

test("profile completion: short bio doesn't count, long bio does", () => {
  const short = getProfileCompletion({ ...emptyProfile, bio: "x".repeat(MIN_BIO_LENGTH - 1) });
  const long  = getProfileCompletion({ ...emptyProfile, bio: "x".repeat(MIN_BIO_LENGTH) });
  assert.equal(short.completed.length, 0);
  assert.equal(long.completed.length, 1);
});

test("profile completion: either social link satisfies the social rule", () => {
  const result = getProfileCompletion({ ...emptyProfile, linkedin_url: "https://linkedin.com/in/x" });
  assert.deepEqual(result.completed, ["Social link (GitHub or LinkedIn)"]);
  assert.equal(result.percent, 13); // 1/8 = 12.5 → rounds to 13
});

test("profile completion: all fields filled is 100%", () => {
  const result = getProfileCompletion({
    ...emptyProfile,
    full_name: "John Carlo", headline: "Developer", bio: "b".repeat(80), avatar_url: "/a.jpg",
    email: "a@b.co", location: "Cebu", resume_url: "/r.pdf", github_url: "https://github.com/x",
  });
  assert.equal(result.percent, 100);
  assert.equal(result.missing.length, 0);
});

// ─── Date ranges ──────────────────────────────────────────────

test("presets end today (UTC) and include both ends", () => {
  assert.deepEqual(presetToRange("7d", NOW), { from: "2026-10-31", to: "2026-11-06" });
  assert.equal(rangeLength(presetToRange("30d", NOW)), 30);
  assert.equal(rangeLength(presetToRange("90d", NOW)), 90);
});

test("parseRangeParams defaults to 30 days and accepts presets", () => {
  assert.deepEqual(parseRangeParams({}, NOW), { ok: true, range: presetToRange("30d", NOW) });
  assert.deepEqual(parseRangeParams({ range: "7d" }, NOW), { ok: true, range: presetToRange("7d", NOW) });
});

test("parseRangeParams rejects bad input", () => {
  const cases = [
    { range: "1y" },
    { from: "2026-11-01" },
    { from: "2026-02-30", to: "2026-03-01" },
    { from: "2026-11-05", to: "2026-11-01" },
    { from: "2026-11-01", to: "2026-11-07" },          // future
    { from: "2025-01-01", to: "2026-11-01" },          // > 365 days
    { from: "11/01/2026", to: "11/05/2026" },
  ];
  for (const params of cases) {
    assert.equal(parseRangeParams(params, NOW).ok, false, JSON.stringify(params));
  }
});

test("parseRangeParams accepts a valid custom range", () => {
  assert.deepEqual(
    parseRangeParams({ from: "2026-10-01", to: "2026-11-06" }, NOW),
    { ok: true, range: { from: "2026-10-01", to: "2026-11-06" } },
  );
});

test("previousRange is the same length, immediately before", () => {
  assert.deepEqual(previousRange({ from: "2026-10-31", to: "2026-11-06" }), { from: "2026-10-24", to: "2026-10-30" });
});

test("enumerateDays crosses month boundaries", () => {
  assert.deepEqual(enumerateDays({ from: "2026-10-30", to: "2026-11-02" }),
    ["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
});

test("parseIsoDay rejects impossible dates", () => {
  assert.equal(parseIsoDay("2026-13-01"), null);
  assert.ok(parseIsoDay("2028-02-29"));
});

// ─── Chart scale ──────────────────────────────────────────────

test("niceMax rounds up to 1/2/2.5/5 × 10ⁿ", () => {
  assert.equal(niceMax(0), 1);
  assert.equal(niceMax(7), 10);
  assert.equal(niceMax(18), 20);
  assert.equal(niceMax(23), 25);
  assert.equal(niceMax(420), 500);
  assert.equal(niceMax(1000), 1000);
});

test("yTicks spans 0..max", () => {
  assert.deepEqual(yTicks(20), [0, 5, 10, 15, 20]);
});

test("toChartPoints maps to the plot area; nearestIndex snaps", () => {
  const box = { width: 200, height: 100, top: 0, right: 0, bottom: 0, left: 0 };
  const pts = toChartPoints([0, 5, 10], 10, box);
  assert.deepEqual(pts.map((p) => [p.x, p.y]), [[0, 100], [100, 50], [200, 0]]);
  assert.equal(nearestIndex(pts, 140), 1);
  assert.equal(nearestIndex(pts, 160), 2);
  assert.match(linePath(pts), /^M0\.00,100\.00 L100\.00,50\.00 L200\.00,0\.00$/);
});

test("a single point is centered", () => {
  const box = { width: 200, height: 100, top: 0, right: 0, bottom: 0, left: 0 };
  assert.equal(toChartPoints([3], 10, box)[0].x, 100);
});

test("labelIndexes keeps first and last", () => {
  const idx = labelIndexes(30, 6);
  assert.equal(idx[0], 0);
  assert.equal(idx.at(-1), 29);
  assert.ok(idx.length <= 6);
  assert.deepEqual(labelIndexes(3, 6), [0, 1, 2]);
});

// ─── Formatting / safety ──────────────────────────────────────

test("percentChange needs a positive baseline", () => {
  assert.equal(percentChange(10, undefined), null);
  assert.equal(percentChange(10, 0), null);
  assert.equal(percentChange(15, 10), 50);
  assert.equal(percentChange(5, 10), -50);
});

test("formatRelative", () => {
  assert.equal(formatRelative("2026-11-06T15:29:40Z", NOW), "just now");
  assert.equal(formatRelative("2026-11-06T12:30:00Z", NOW), "3 hours ago");
  assert.equal(formatRelative("2026-11-05T15:30:00Z", NOW), "yesterday");
});

test("safeAdminRedirect blocks open redirects", () => {
  assert.equal(safeAdminRedirect(null), "/admin");
  assert.equal(safeAdminRedirect("https://evil.com"), "/admin");
  assert.equal(safeAdminRedirect("//evil.com/admin"), "/admin");
  assert.equal(safeAdminRedirect("/admin\\@evil.com"), "/admin");
  assert.equal(safeAdminRedirect("/admin/login"), "/admin");
  assert.equal(safeAdminRedirect("/blog"), "/admin");
  assert.equal(safeAdminRedirect("/admin"), "/admin");
});
