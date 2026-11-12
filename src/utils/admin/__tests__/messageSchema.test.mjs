// Contact Messages: status validation and inbox helpers.
import { test } from "node:test";
import assert from "node:assert/strict";

import { matchesMessage, messageStatusSchema, replyMailto, senderName } from "../messageSchema.ts";

const msg = {
  id: "1", first_name: "Jane", last_name: "Doe", email: "jane@example.com",
  subject: "Website redesign", inquiry_type: "Freelance", budget: null,
  message: "Can you rebuild our landing page?", status: "new", read_at: null,
  created_at: "2026-11-12T00:00:00Z",
};

test("only known statuses are accepted", () => {
  for (const status of ["new", "read", "archived"]) {
    assert.equal(messageStatusSchema.safeParse({ status }).success, true, status);
  }
  for (const body of [{ status: "spam" }, { status: "" }, {}, null]) {
    assert.equal(messageStatusSchema.safeParse(body).success, false, JSON.stringify(body));
  }
});

test("sender name falls back to the email when no name was given", () => {
  assert.equal(senderName(msg), "Jane Doe");
  assert.equal(senderName({ ...msg, last_name: null }), "Jane");
  assert.equal(senderName({ ...msg, first_name: " ", last_name: null }), "jane@example.com");
});

test("reply link encodes the address and adds Re: once", () => {
  assert.equal(replyMailto(msg), "mailto:jane%40example.com?subject=Re%3A%20Website%20redesign");
  assert.equal(replyMailto({ ...msg, subject: "RE: Hello" }), "mailto:jane%40example.com?subject=RE%3A%20Hello");
  // A crafted address can't add extra mailto fields (e.g. cc or body).
  assert.ok(!replyMailto({ ...msg, email: "a@b.com?cc=x@y.com" }).includes("?cc="));
});

test("search covers sender, subject and body, ignoring case", () => {
  assert.equal(matchesMessage(msg, ""), true);
  assert.equal(matchesMessage(msg, "jane"), true);
  assert.equal(matchesMessage(msg, "REDESIGN"), true);
  assert.equal(matchesMessage(msg, "landing page"), true);
  assert.equal(matchesMessage(msg, "freelance"), true);
  assert.equal(matchesMessage(msg, "invoice"), false);
});
