// Personal Profile validation and bio paragraph splitting.
import { test } from "node:test";
import assert from "node:assert/strict";

import { profileInputSchema, toParagraphs } from "../profileSchema.ts";
import { PROFILE_COMPLETION_RULES } from "../profileCompletion.ts";

const base = { full_name: "John Carlo A. Ylanan" };
const fails = (extra) => !profileInputSchema.safeParse({ ...base, ...extra }).success;

test("only the name is required; blanks become null", () => {
  const r = profileInputSchema.parse({ ...base, headline: "  ", email: "", phone: "" });
  assert.equal(r.headline, null);
  assert.equal(r.email, null);
  assert.equal(r.phone, null);
  assert.ok(fails({ full_name: "  " }));
});

test("email and phone formats", () => {
  assert.ok(fails({ email: "not-an-email" }));
  assert.ok(!fails({ email: "johncarlo.fullstackdev@gmail.com" }));
  assert.ok(fails({ phone: "call me" }));
  assert.ok(!fails({ phone: "(+632) 9293-1982" }));
});

test("GitHub/LinkedIn must be on their own domains", () => {
  assert.ok(!fails({ github_url: "https://github.com/John-Developr" }));
  assert.ok(fails({ github_url: "https://gitlab.com/x" }));
  assert.ok(fails({ github_url: "https://github.com.evil.io/x" }));
  assert.ok(!fails({ linkedin_url: "https://ph.linkedin.com/in/johncarlo-fullstackdev" }));
  assert.ok(fails({ linkedin_url: "javascript:alert(1)" }));
});

test("photo and resume must be site paths", () => {
  assert.ok(!fails({ avatar_url: "/images/Avatar.jpg", resume_url: "/documents/resume.pdf" }));
  assert.ok(fails({ avatar_url: "https://example.com/me.jpg" }));
  assert.ok(fails({ resume_url: "//evil.com/r.pdf" }));
});

test("bio splits into paragraphs on blank lines", () => {
  assert.deepEqual(toParagraphs("One.\n\nTwo.\n  \nThree."), ["One.", "Two.", "Three."]);
  assert.deepEqual(toParagraphs("Line one\nstill one"), ["Line one\nstill one"]);
  assert.deepEqual(toParagraphs(null), []);
});

test("every completion rule points at a form field", () => {
  const fields = new Set(Object.keys(profileInputSchema.shape));
  for (const rule of PROFILE_COMPLETION_RULES) assert.ok(fields.has(rule.field), rule.field);
});

test("booking and social links", () => {
  assert.ok(!fails({ booking_url: "https://calendly.com/johncarlo-fullstackdev/30min" }));
  assert.ok(fails({ booking_url: "calendly.com/x" }));
  assert.ok(!fails({ facebook_url: "https://www.facebook.com/johncarlo.devolpr" }));
  assert.ok(fails({ facebook_url: "https://facebook.com.evil.io/x" }));
  assert.ok(!fails({ instagram_url: "https://instagram.com/john" }));
  assert.ok(!fails({ x_url: "https://twitter.com/john" }));
  assert.ok(!fails({ x_url: "https://x.com/john" }));
  assert.ok(fails({ x_url: "https://mastodon.social/@john" }));
});
