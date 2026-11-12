/* ============================================================
   MARKDOWN FORMATTING (admin editor toolbar)
   ------------------------------------------------------------
   Pure text transforms behind the MarkdownEditor buttons: take
   the text and the selection, return the new text and the new
   selection. Only syntax the public blog renders (CommonMark,
   react-markdown without GFM), so no strikethrough or tables.
   ============================================================ */

export type MarkdownAction =
  | "bold" | "italic" | "code"
  | "h2" | "h3" | "quote" | "bullet" | "number"
  | "link" | "codeblock";

export interface TextEdit {
  value: string;
  start: number;   // selection start
  end:   number;   // selection end
}

const WRAPS: Partial<Record<MarkdownAction, { mark: string; placeholder: string }>> = {
  bold:   { mark: "**", placeholder: "bold text" },
  italic: { mark: "_",  placeholder: "italic text" },
  code:   { mark: "`",  placeholder: "code" },
};

const PREFIXES: Partial<Record<MarkdownAction, string>> = {
  h2:     "## ",
  h3:     "### ",
  quote:  "> ",
  bullet: "- ",
};

/** Any block prefix a line can have; replaced when switching e.g. bullet → heading. */
const ANY_PREFIX = /^(#{1,6} |> |- |\* |\d+\. )/;

/** Applies a toolbar action to `value` with the selection `start`–`end`. */
export function applyMarkdown(value: string, start: number, end: number, action: MarkdownAction): TextEdit {
  const wrap = WRAPS[action];
  if (wrap) return toggleWrap(value, start, end, wrap.mark, wrap.placeholder);

  if (action === "link")      return insertLink(value, start, end);
  if (action === "codeblock") return insertCodeBlock(value, start, end);
  return toggleLinePrefix(value, start, end, action);
}

/** `**text**` around the selection; removes the marks if they're already there. */
function toggleWrap(value: string, start: number, end: number, mark: string, placeholder: string): TextEdit {
  const n = mark.length;
  const before = value.slice(start - n, start);
  const after  = value.slice(end, end + n);

  if (start >= n && before === mark && after === mark) {
    return {
      value: value.slice(0, start - n) + value.slice(start, end) + value.slice(end + n),
      start: start - n,
      end:   end - n,
    };
  }

  const text = value.slice(start, end) || placeholder;
  return {
    value: value.slice(0, start) + mark + text + mark + value.slice(end),
    start: start + n,
    end:   start + n + text.length,
  };
}

/** `[text](https://)` with the URL selected, ready to paste over. */
function insertLink(value: string, start: number, end: number): TextEdit {
  const text = value.slice(start, end) || "link text";
  const url  = "https://";
  const urlStart = start + text.length + 3;   // after "[text]("

  return {
    value: value.slice(0, start) + `[${text}](${url})` + value.slice(end),
    start: urlStart,
    end:   urlStart + url.length,
  };
}

/** Fenced code block around the selected lines (or an empty one). */
function insertCodeBlock(value: string, start: number, end: number): TextEdit {
  const [lineStart, lineEnd] = lineRange(value, start, end);
  const body   = value.slice(lineStart, lineEnd) || "code";
  const before = lineStart > 0 && value[lineStart - 1] !== "\n" ? "\n" : "";
  const block  = `${before}\`\`\`\n${body}\n\`\`\``;
  const bodyStart = lineStart + before.length + 4;

  return {
    value: value.slice(0, lineStart) + block + value.slice(lineEnd),
    start: bodyStart,
    end:   bodyStart + body.length,
  };
}

/**
 * Adds a block prefix (heading, quote, list) to every selected line.
 * If every line already has it, removes it instead. Numbered lists
 * are numbered 1., 2., 3. …
 */
function toggleLinePrefix(value: string, start: number, end: number, action: MarkdownAction): TextEdit {
  const [lineStart, lineEnd] = lineRange(value, start, end);
  const lines  = value.slice(lineStart, lineEnd).split("\n");
  const prefix = (i: number) => (action === "number" ? `${i + 1}. ` : PREFIXES[action] ?? "");
  const has    = (line: string, i: number) =>
    action === "number" ? /^\d+\. /.test(line) : line.startsWith(prefix(i));

  const remove = lines.every((line, i) => line === "" || has(line, i));
  const next   = lines.map((line, i) => {
    if (line === "" && lines.length > 1) return line;
    const bare = line.replace(ANY_PREFIX, "");
    return remove ? bare : prefix(i) + bare;
  });

  const replaced = next.join("\n");
  return {
    value: value.slice(0, lineStart) + replaced + value.slice(lineEnd),
    start: lineStart,
    end:   lineStart + replaced.length,
  };
}

/** Start of the first and end of the last line touched by the selection. */
function lineRange(value: string, start: number, end: number): [number, number] {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nl        = value.indexOf("\n", end > start && value[end - 1] === "\n" ? end - 1 : end);
  return [lineStart, nl === -1 ? value.length : nl];
}
