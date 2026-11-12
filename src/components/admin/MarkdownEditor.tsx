'use client'

import { KeyboardEvent, TextareaHTMLAttributes, useLayoutEffect, useRef, useState } from "react";
import BlogMarkdown from "@/components/blog/BlogMarkdown";
import { AdminIcons, AdminIconComponent } from "@/components/icons/admin";
import { applyMarkdown, MarkdownAction } from "@/utils/admin/markdownFormat";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminForm.module.css";

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

interface MarkdownEditorProps extends TextareaProps {
    value:    string;
    onChange: (value: string) => void;
}

const TOOLS: { action: MarkdownAction; label: string; icon: AdminIconComponent; keys?: string }[] = [
    { action: "bold",      label: "Bold",          icon: AdminIcons.Bold,        keys: "Ctrl+B" },
    { action: "italic",    label: "Italic",        icon: AdminIcons.Italic,      keys: "Ctrl+I" },
    { action: "h2",        label: "Heading",       icon: AdminIcons.Heading2 },
    { action: "h3",        label: "Subheading",    icon: AdminIcons.Heading3 },
    { action: "bullet",    label: "Bulleted list", icon: AdminIcons.List },
    { action: "number",    label: "Numbered list", icon: AdminIcons.ListOrdered },
    { action: "quote",     label: "Quote",         icon: AdminIcons.Quote },
    { action: "link",      label: "Link",          icon: AdminIcons.Link,        keys: "Ctrl+K" },
    { action: "code",      label: "Inline code",   icon: AdminIcons.Code },
    { action: "codeblock", label: "Code block",    icon: AdminIcons.SquareCode },
];

/** Groups split by a divider in the toolbar: text · blocks · insert. */
const GROUP_ENDS = new Set<MarkdownAction>(["italic", "h3", "quote"]);

const SHORTCUTS: Record<string, MarkdownAction> = { b: "bold", i: "italic", k: "link" };

/**
 * Markdown textarea with a formatting toolbar (bold, italic, headings,
 * lists, quote, link, code) and a Write / Preview switch. The preview
 * uses BlogMarkdown, the same renderer as the public blog post page.
 * Other props (id, aria-*, rows) go to the textarea.
 */
export default function MarkdownEditor({ value, onChange, disabled, ...textareaProps }: MarkdownEditorProps) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const [mode,      setMode]      = useState<"write" | "preview">("write");
    const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);

    // Restore the selection after React writes the new value.
    useLayoutEffect(() => {
        if (!selection || !ref.current) return;
        ref.current.focus();
        ref.current.setSelectionRange(selection.start, selection.end);
        setSelection(null);
    }, [selection]);

    const run = (action: MarkdownAction) => {
        const el = ref.current;
        if (!el) return;
        const edit = applyMarkdown(value, el.selectionStart, el.selectionEnd, action);
        onChange(edit.value);
        setSelection({ start: edit.start, end: edit.end });
    };

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        const action = (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey ? SHORTCUTS[e.key.toLowerCase()] : undefined;
        if (!action) return;
        e.preventDefault();
        run(action);
    };

    const writing = mode === "write";

    return (
        <div className={`${styles["md-editor"]} ${disabled ? styles["md-disabled"] : ""}`}>
            <div className={styles["md-toolbar"]}>
                <div className={styles["md-tools"]} role="toolbar" aria-label="Formatting">
                    {TOOLS.map(({ action, label, icon: Icon, keys }) => (
                        <span key={action} className={GROUP_ENDS.has(action) ? styles["md-group-end"] : undefined}>
                            <button
                                type="button"
                                className={adminStyles["icon-btn"]}
                                title={keys ? `${label} (${keys})` : label}
                                aria-label={label}
                                disabled={disabled || !writing}
                                // Keep the textarea's selection when the button is clicked.
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => run(action)}>
                                <Icon width={16} height={16} />
                            </button>
                        </span>
                    ))}
                </div>

                <div className={styles["md-tabs"]} role="group" aria-label="Editor mode">
                    {(["write", "preview"] as const).map((m) => (
                        <button
                            key={m}
                            type="button"
                            aria-pressed={mode === m}
                            className={mode === m ? styles.selected : ""}
                            onClick={() => setMode(m)}>
                            {m === "write" ? "Write" : "Preview"}
                        </button>
                    ))}
                </div>
            </div>

            {writing ? (
                <textarea
                    {...textareaProps}
                    ref={ref}
                    value={value}
                    disabled={disabled}
                    onKeyDown={onKeyDown}
                    onChange={(e) => onChange(e.target.value)} />
            ) : (
                <div className={styles["md-preview"]}>
                    {value.trim()
                        ? <BlogMarkdown content={value} />
                        : <p className={styles["field-hint"]}>Nothing to preview yet.</p>}
                </div>
            )}
        </div>
    );
}
