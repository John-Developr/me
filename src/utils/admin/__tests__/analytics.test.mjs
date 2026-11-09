// First-party analytics: what gets recorded.
import { test } from "node:test";
import assert from "node:assert/strict";

import { hasOptedOut, isLikelyBot, normalizePath, referrerHost } from "../../analytics.ts";

const CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

test("bots and tools are not counted; browsers are", () => {
  for (const ua of ["Googlebot/2.1 (+http://www.google.com/bot.html)", "facebookexternalhit/1.1", "Mozilla/5.0 HeadlessChrome/120", "curl/8.4.0", "python-requests/2.31", "", null]) {
    assert.equal(isLikelyBot(ua), true, String(ua));
  }
  assert.equal(isLikelyBot(CHROME), false);
});

test("Do Not Track / Global Privacy Control opt out", () => {
  assert.equal(hasOptedOut({ dnt: "1" }), true);
  assert.equal(hasOptedOut({ gpc: "1" }), true);
  assert.equal(hasOptedOut({ dnt: "0", gpc: null }), false);
});

test("paths are cleaned; admin and API paths are never stored", () => {
  assert.equal(normalizePath("/projects?ref=x#top"), "/projects");
  assert.equal(normalizePath("/blog/my-post/"), "/blog/my-post");
  assert.equal(normalizePath("/"), "/");
  for (const bad of ["/admin", "/admin/projects", "/api/p", "//evil.com", "projects", "/" + "a".repeat(250), 42, null]) {
    assert.equal(normalizePath(bad), null, String(bad));
  }
  assert.equal(normalizePath("/administrator-notes"), "/administrator-notes");
});

test("only external referrer hosts are kept", () => {
  assert.equal(referrerHost("https://www.Google.com/search?q=john", "johncarlo-portfolio.vercel.app"), "google.com");
  assert.equal(referrerHost("https://johncarlo-portfolio.vercel.app/blog", "johncarlo-portfolio.vercel.app"), null);
  assert.equal(referrerHost("http://localhost:3000/", "localhost:3000"), null);
  assert.equal(referrerHost("not a url", "x.com"), null);
  assert.equal(referrerHost("", "x.com"), null);
});

// ─── Visit details ───────────────────────────────────────────
import { flagEmoji, parseUserAgent, readVercelGeo } from "../../analytics.ts";

test("device, browser and OS families", () => {
  const cases = [
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1", "mobile", "Safari", "iOS"],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36", "desktop", "Chrome", "macOS"],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0", "desktop", "Edge", "Windows"],
    ["Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0 Mobile Safari/537.36", "mobile", "Samsung Internet", "Android"],
    ["Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36", "tablet", "Chrome", "Android"],
    ["Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1", "tablet", "Chrome", "iPadOS"],
    ["Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0", "desktop", "Firefox", "Linux"],
  ];
  for (const [ua, device, browser, os] of cases) {
    assert.deepEqual(parseUserAgent(ua), { device, browser, os }, ua);
  }
});

test("location comes from Vercel headers only", () => {
  const h = { "x-vercel-ip-country": "ph", "x-vercel-ip-country-region": "07", "x-vercel-ip-city": "Cebu%20City" };
  assert.deepEqual(readVercelGeo((n) => h[n] ?? null), { country: "PH", region: "07", city: "Cebu City" });
  assert.deepEqual(readVercelGeo(() => null), { country: null, region: null, city: null });
  assert.equal(readVercelGeo((n) => (n === "x-vercel-ip-country" ? "XYZ" : null)).country, null);
  assert.equal(readVercelGeo((n) => (n === "x-vercel-ip-city" ? "%E0%A4%A" : null)).city, null); // bad encoding
});

test("flags", () => {
  assert.equal(flagEmoji("PH"), "🇵🇭");
  assert.equal(flagEmoji("us"), "🇺🇸");
  assert.equal(flagEmoji(null), "🌐");
});
