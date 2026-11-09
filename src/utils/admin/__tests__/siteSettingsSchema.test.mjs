// SEO Settings: site icon validation.
import { test } from "node:test";
import assert from "node:assert/strict";

import { siteSettingsSchema } from "../siteSettingsSchema.ts";

test("site icon: empty = default; images ok; PDFs and outside URLs rejected", () => {
  assert.equal(siteSettingsSchema.parse({ favicon_url: "" }).favicon_url, null);
  assert.equal(siteSettingsSchema.parse({ favicon_url: "/favicon.png" }).favicon_url, "/favicon.png");
  assert.equal(siteSettingsSchema.safeParse({ favicon_url: "/documents/x.pdf" }).success, false);
  assert.equal(siteSettingsSchema.safeParse({ favicon_url: "https://evil.com/icon.png" }).success, false);
});
