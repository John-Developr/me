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
