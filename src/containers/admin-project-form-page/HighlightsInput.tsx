'use client'

import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminProjects.module.css";

interface HighlightsInputProps {
    id:        string;
    items:     string[];
    max:       number;
    maxLength: number;
    onChange:  (items: string[]) => void;
}

/** Editable list of short bullet points (one input per item). */
export default function HighlightsInput({ id, items, max, maxLength, onChange }: HighlightsInputProps) {
    const update = (index: number, value: string) => onChange(items.map((item, i) => (i === index ? value : item)));
    const removeAt = (index: number) => onChange(items.filter((_, i) => i !== index));

    return (
        <div className={styles.list}>
            {items.map((item, index) => (
                <div key={index} className={styles["list-row"]}>
                    <span className={styles.bullet} aria-hidden="true">•</span>
                    <input
                        id={index === 0 ? id : undefined}
                        value={item}
                        maxLength={maxLength}
                        aria-label={`Highlight ${index + 1}`}
                        onChange={(e) => update(index, e.target.value)} />
                    <button
                        type="button"
                        className={adminStyles["icon-btn"]}
                        aria-label={`Remove highlight ${index + 1}`}
                        onClick={() => removeAt(index)}>
                        <AdminIcons.Close width={15} height={15} />
                    </button>
                </div>
            ))}

            <button
                type="button"
                id={items.length === 0 ? id : undefined}
                className={adminStyles["btn-ghost"]}
                disabled={items.length >= max}
                onClick={() => onChange([...items, ""])}>
                <AdminIcons.Plus width={14} height={14} />
                {items.length >= max ? `Maximum of ${max} reached` : "Add highlight"}
            </button>
        </div>
    );
}
