// Account Settings validation (display name, password change).
import { test } from "node:test";
import assert from "node:assert/strict";

import { displayNameSchema, passwordChangeSchema } from "../accountSchema.ts";
import { toFieldErrors } from "../formErrors.ts";

const ok = { currentPassword: "old-pass-1", newPassword: "new-pass-2", confirmPassword: "new-pass-2" };
const errorsFor = (input) => {
  const r = passwordChangeSchema.safeParse(input);
  return r.success ? {} : toFieldErrors(r.error);
};

test("display name is trimmed and required", () => {
  assert.equal(displayNameSchema.parse({ displayName: "  John Carlo  " }).displayName, "John Carlo");
  assert.equal(displayNameSchema.safeParse({ displayName: "   " }).success, false);
  assert.equal(displayNameSchema.safeParse({ displayName: "x".repeat(81) }).success, false);
});

test("valid password change defaults to signing out other devices", () => {
  const r = passwordChangeSchema.parse(ok);
  assert.equal(r.signOutOthers, true);
  assert.equal(passwordChangeSchema.parse({ ...ok, signOutOthers: false }).signOutOthers, false);
});

test("password rules", () => {
  assert.ok(errorsFor({ ...ok, newPassword: "a1", confirmPassword: "a1" }).newPassword);                   // too short
  assert.ok(errorsFor({ ...ok, newPassword: "abcdefgh", confirmPassword: "abcdefgh" }).newPassword);       // no number
  assert.ok(errorsFor({ ...ok, newPassword: "12345678", confirmPassword: "12345678" }).newPassword);       // no letter
  assert.ok(errorsFor({ ...ok, newPassword: "a1".repeat(37), confirmPassword: "a1".repeat(37) }).newPassword); // > 72
  assert.ok(errorsFor({ ...ok, confirmPassword: "different-1" }).confirmPassword);                          // mismatch
  assert.ok(errorsFor({ ...ok, newPassword: "old-pass-1", confirmPassword: "old-pass-1" }).newPassword);   // same as current
  assert.ok(errorsFor({ ...ok, currentPassword: "" }).currentPassword);
});
