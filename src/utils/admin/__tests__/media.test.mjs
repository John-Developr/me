// Media Library helpers: type detection, paths, URLs, sizes.
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildObjectPath, detectMime, formatBytes, isMediaUrl, toGB } from "../../media.ts";

const bytes = (...parts) => new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)));

test("detects real file types from their first bytes", () => {
  assert.equal(detectMime(bytes([0x89], "PNG", [0x0d, 0x0a, 0x1a, 0x0a], [0, 0])), "image/png");
  assert.equal(detectMime(bytes([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(detectMime(bytes("GIF89a")), "image/gif");
  assert.equal(detectMime(bytes("RIFF", [1, 2, 3, 4], "WEBPVP8 ")), "image/webp");
  assert.equal(detectMime(bytes([0, 0, 0, 28], "ftypavif")), "image/avif");
  assert.equal(detectMime(bytes("%PDF-1.7")), "application/pdf");
});

test("rejects disguised or unsupported files", () => {
  assert.equal(detectMime(bytes("<svg xmlns=")), null);               // SVG
  assert.equal(detectMime(bytes("<html><script>")), null);            // HTML renamed .png
  assert.equal(detectMime(bytes("MZ", [0x90, 0])), null);             // executable
  assert.equal(detectMime(new Uint8Array()), null);
});

test("object paths are dated, unique and use the detected extension", () => {
  const p = buildObjectPath("My Logo (final).PNG", "image/webp", "abc123", new Date("2026-11-06T00:00:00Z"));
  assert.equal(p, "2026/11/abc123-my-logo-final.webp");
  assert.equal(buildObjectPath("....", "application/pdf", "id", new Date("2026-01-01")), "2026/01/id-file.pdf");
});

test("media URLs must belong to this project's bucket", () => {
  const SB = "https://abc.supabase.co";
  const base = `${SB}/storage/v1/object/public/media/`;
  assert.equal(isMediaUrl(`${base}2026/11/x-logo.png`, SB), true);
  assert.equal(isMediaUrl(`${base}../secret`, SB), false);
  assert.equal(isMediaUrl(`${SB}/storage/v1/object/public/other/x.png`, SB), false);
  assert.equal(isMediaUrl("https://evil.com/storage/v1/object/public/media/x.png", SB), false);
  assert.equal(isMediaUrl(`${base}`, SB), false);
});

test("sizes", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(1536), "1.50 KB");
  assert.equal(formatBytes(4 * 1024 * 1024), "4.00 MB");
  assert.equal(toGB(1024 ** 3 / 4), "0.25");
});
