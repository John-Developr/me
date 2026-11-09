'use client'

import { KeyboardEvent, useState } from "react";

import { AdminIcons } from "@/components/icons/admin";
import styles from "@/styles/pages/adminForm.module.css";

interface TagInputProps {
    id:        string;
    /** Placeholder when empty, e.g. "e.g. Next.js". */
    placeholder?: string;
    items:     string[];
    max:       number;
    maxLength: number;
    onChange:  (items: string[]) => void;
}

/**
 * Chip input: Enter or comma adds, Backspace on an empty field removes the
 * last chip. Duplicates are ignored case-insensitively.
 */
export default function TagInput({ id, items, max, maxLength, onChange, placeholder = "e.g. Next.js" }: TagInputProps) {
    const [draft, setDraft] = useState<string>("");

    const add = (raw: string) => {
        const value = raw.trim().replace(/,+$/, "").trim();
        if (!value || items.length >= max) return;
        if (items.some((item) => item.toLowerCase() === value.toLowerCase())) return;
        onChange([...items, value.slice(0, maxLength)]);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
            setDraft("");
        } else if (e.key === "Backspace" && draft === "" && items.length > 0) {
            onChange(items.slice(0, -1));
        }
    };

    return (
        <div className={styles.tags}>
            {items.map((item) => (
                <span key={item} className={styles.tag}>
                    {item}
                    <button
                        type="button"
                        aria-label={`Remove ${item}`}
                        onClick={() => onChange(items.filter((i) => i !== item))}>
                        <AdminIcons.Close width={12} height={12} />
                    </button>
                </span>
            ))}
            <input
                id={id}
                className={styles["tag-input"]}
                value={draft}
                maxLength={maxLength}
                disabled={items.length >= max}
                placeholder={items.length >= max ? `Maximum of ${max}` : items.length ? "Add more…" : placeholder}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => { add(draft); setDraft(""); }} />
        </div>
    );
}
