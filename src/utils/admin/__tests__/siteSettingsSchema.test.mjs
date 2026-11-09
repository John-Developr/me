// SEO Settings validation.
import { test } from "node:test";
import assert from "node:assert/strict";

import { extractVerification, normalizeHandle, seoSettingsSchema, siteSettingsSchema } from "../siteSettingsSchema.ts";

const site = { site_name: "John Carlo Ylanan", favicon_url: "", twitter_handle: "", google_verification: "", allow_indexing: true };
const page = { key: "home", title: "John Carlo Ylanan — Web & Mobile Developer", description: "Portfolio.", keywords: [] };

test("site icon: empty = default; images ok; PDFs and outside URLs rejected", () => {
  assert.equal(siteSettingsSchema.parse(site).favicon_url, null);
  assert.equal(siteSettingsSchema.parse({ ...site, favicon_url: "/favicon.png" }).favicon_url, "/favicon.png");
  assert.equal(siteSettingsSchema.safeParse({ ...site, favicon_url: "/documents/x.pdf" }).success, false);
  assert.equal(siteSettingsSchema.safeParse({ ...site, favicon_url: "https://evil.com/icon.png" }).success, false);
});

test("X handle is normalized from any common form", () => {
  for (const raw of ["johncarlo_dev", "@johncarlo_dev", "https://x.com/johncarlo_dev", "https://twitter.com/johncarlo_dev?lang=en"]) {
    assert.equal(normalizeHandle(raw), "@johncarlo_dev", raw);
  }
  assert.equal(normalizeHandle("x.com/johncarlo_dev"), "@johncarlo_dev");
  assert.equal(siteSettingsSchema.safeParse({ ...site, twitter_handle: "not a handle!" }).success, false);
  assert.equal(siteSettingsSchema.parse({ ...site, twitter_handle: "" }).twitter_handle, null);
});

test("Google verification accepts the code or the whole meta tag", () => {
  const tag = '<meta name="google-site-verification" content="googlec34b432acc53a5cc" />';
  assert.equal(extractVerification(tag), "googlec34b432acc53a5cc");
  assert.equal(siteSettingsSchema.parse({ ...site, google_verification: tag }).google_verification, "googlec34b432acc53a5cc");
  assert.equal(siteSettingsSchema.safeParse({ ...site, google_verification: "<script>" }).success, false);
});

test("site name is required", () => {
  assert.equal(siteSettingsSchema.safeParse({ ...site, site_name: "  " }).success, false);
});

test("pages: title/description required with hard limits; unknown pages rejected", () => {
  assert.equal(seoSettingsSchema.safeParse({ settings: site, pages: [page] }).success, true);
  assert.equal(seoSettingsSchema.safeParse({ settings: site, pages: [{ ...page, title: "" }] }).success, false);
  assert.equal(seoSettingsSchema.safeParse({ settings: site, pages: [{ ...page, title: "x".repeat(71) }] }).success, false);
  assert.equal(seoSettingsSchema.safeParse({ settings: site, pages: [{ ...page, description: "x".repeat(201) }] }).success, false);
  assert.equal(seoSettingsSchema.safeParse({ settings: site, pages: [{ ...page, key: "admin" }] }).success, false);
  const kw = seoSettingsSchema.parse({ settings: site, pages: [{ ...page, keywords: ["a", "a", " ", "b"] }] }).pages[0].keywords;
  assert.deepEqual(kw, ["a", "b"]);
});
