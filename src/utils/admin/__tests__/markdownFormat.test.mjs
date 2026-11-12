// Text transforms behind the admin Markdown editor toolbar.
import { test } from "node:test";
import assert from "node:assert/strict";

import { applyMarkdown } from "../markdownFormat.ts";

const pick = ({ value, start, end }) => ({ value, selected: value.slice(start, end) });

test("bold wraps the selection and keeps it selected", () => {
  assert.deepEqual(pick(applyMarkdown("say hello now", 4, 9, "bold")), { value: "say **hello** now", selected: "hello" });
});

test("bold again removes the marks", () => {
  assert.deepEqual(pick(applyMarkdown("say **hello** now", 6, 11, "bold")), { value: "say hello now", selected: "hello" });
});

test("italic with no selection inserts a selected placeholder", () => {
  assert.deepEqual(pick(applyMarkdown("ab", 1, 1, "italic")), { value: "a_italic text_b", selected: "italic text" });
});

test("link selects the URL to paste over", () => {
  assert.deepEqual(pick(applyMarkdown("see docs", 4, 8, "link")), { value: "see [docs](https://)", selected: "https://" });
});

test("heading applies to the whole current line and toggles off", () => {
  const on = applyMarkdown("one\ntwo\nthree", 5, 5, "h2");
  assert.equal(on.value, "one\n## two\nthree");
  assert.equal(applyMarkdown(on.value, 6, 6, "h2").value, "one\ntwo\nthree");
});

test("switching block type replaces the old prefix", () => {
  assert.equal(applyMarkdown("- item", 0, 0, "h3").value, "### item");
});

test("lists apply to every selected line; numbered lists count up", () => {
  assert.equal(applyMarkdown("a\nb\nc", 0, 5, "bullet").value, "- a\n- b\n- c");
  assert.equal(applyMarkdown("a\nb\nc", 0, 5, "number").value, "1. a\n2. b\n3. c");
  assert.equal(applyMarkdown("1. a\n2. b", 0, 9, "number").value, "a\nb");
});

test("blank lines inside a multi-line selection stay blank", () => {
  assert.equal(applyMarkdown("a\n\nb", 0, 4, "quote").value, "> a\n\n> b");
});

test("code block fences the selected lines", () => {
  assert.deepEqual(pick(applyMarkdown("x\nconst a = 1;\ny", 2, 14, "codeblock")), {
    value: "x\n```\nconst a = 1;\n```\ny",
    selected: "const a = 1;",
  });
});
