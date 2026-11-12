'use client'

import { CSSProperties, KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { AdminIcons } from "@/components/icons/admin";
import styles from "@/styles/pages/adminForm.module.css";

/* ============================================================
   SELECT
   ------------------------------------------------------------
   Themed replacement for <select> in admin forms (WAI-ARIA
   "select-only combobox"): focus stays on the trigger, the list
   follows with aria-activedescendant.
   Keys: ↑/↓/Home/End move, Enter/Space pick, Esc/Tab close,
   letters jump to the next matching option.
   The list is portalled (into the open <dialog> when inside one,
   else <body>) with fixed positioning, so scrolling containers
   such as the form dialog body can't clip it. It flips above the
   trigger when there's no room below and closes on outside
   press, scroll or resize.
   ============================================================ */

export interface SelectOption<T extends string = string> {
    value: T;
    label: string;
}

interface SelectProps<T extends string> {
    /** Control id (FormField's label points here). */
    id:                  string;
    value:               T | "";
    options:             readonly SelectOption<T>[];
    /** Shown when no option matches `value`. */
    placeholder?:        string;
    disabled?:           boolean;
    "aria-invalid"?:     boolean;
    "aria-describedby"?: string;
    onChange:            (value: T) => void;
}

const MAX_LIST_HEIGHT = 280;
const GAP             = 6;    // px between trigger and list
const EDGE            = 12;   // px kept clear of the viewport edge

export default function Select<T extends string>({
    id, value, options, placeholder = "Choose…", disabled, onChange, ...aria
}: SelectProps<T>) {
    const [open,   setOpen]   = useState<boolean>(false);
    const [active, setActive] = useState<number>(-1);
    const [place,  setPlace]  = useState<CSSProperties>({});

    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef    = useRef<HTMLUListElement>(null);
    const typeahead  = useRef<{ text: string; timer?: ReturnType<typeof setTimeout> }>({ text: "" });
    const listId     = useId();
    const optionId   = (i: number) => `${listId}-${i}`;

    const selectedIndex = options.findIndex((o) => o.value === value);
    const selected      = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    const close = useCallback(() => setOpen(false), []);

    const openList = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const below   = window.innerHeight - rect.bottom - GAP - EDGE;
        const above   = rect.top - GAP - EDGE;
        const wanted  = Math.min(MAX_LIST_HEIGHT, options.length * 38 + 14);
        const flipUp  = below < wanted && above > below;

        setPlace({
            left:      rect.left,
            width:     rect.width,
            maxHeight: Math.min(MAX_LIST_HEIGHT, flipUp ? above : below),
            ...(flipUp ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }),
        });
        setActive(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
    };

    const choose = (i: number) => {
        const option = options[i];
        if (option && option.value !== value) onChange(option.value);
        setOpen(false);
    };

    /** Next option (after `from`, wrapping) whose label starts with the typed text. */
    const findByText = (key: string, from: number): number => {
        const t = typeahead.current;
        clearTimeout(t.timer);
        t.text  = (t.text + key).toLowerCase();
        t.timer = setTimeout(() => { t.text = ""; }, 500);

        const start = t.text.length > 1 ? from : from + 1;   // repeat a letter → cycle
        for (let k = 0; k < options.length; k++) {
            const i = (start + k + options.length) % options.length;
            if (options[i].label.toLowerCase().startsWith(t.text)) return i;
        }
        return -1;
    };

    const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
        const last = options.length - 1;

        if (!open) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
                e.preventDefault();
                openList();
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const i = findByText(e.key, selectedIndex);
                if (i >= 0) choose(i);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown": e.preventDefault(); setActive((i) => Math.min(last, i + 1)); break;
            case "ArrowUp":   e.preventDefault(); setActive((i) => Math.max(0, i - 1)); break;
            case "Home":      e.preventDefault(); setActive(0); break;
            case "End":       e.preventDefault(); setActive(last); break;
            case "Enter":
            case " ":         e.preventDefault(); choose(active); break;
            case "Escape":
                // Don't let Escape also close a surrounding <dialog>.
                e.preventDefault();
                e.stopPropagation();
                close();
                break;
            case "Tab":       close(); break;
            default:
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    const i = findByText(e.key, active);
                    if (i >= 0) setActive(i);
                }
        }
    };

    // Outside press, page/container scroll and resize close the list.
    useEffect(() => {
        if (!open) return;

        const inside = (target: EventTarget | null) =>
            target instanceof Node && (triggerRef.current?.contains(target) || listRef.current?.contains(target));

        const onPointerDown = (e: PointerEvent) => { if (!inside(e.target)) close(); };
        const onScroll      = (e: Event) => { if (!listRef.current?.contains(e.target as Node)) close(); };

        document.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", close);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", close);
        };
    }, [open, close]);

    // Keep the keyboard-active option visible.
    useEffect(() => {
        if (open && active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, active]);

    useEffect(() => () => clearTimeout(typeahead.current.timer), []);

    const list = open && (
        <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={id}
            className={styles["select-list"]}
            style={place}
            // Keep focus on the trigger while clicking an option.
            onMouseDown={(e) => e.preventDefault()}>
            {options.map((o, i) => {
                const isSelected = i === selectedIndex;
                return (
                    <li
                        key={o.value}
                        id={optionId(i)}
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles["select-option"]} ${i === active ? styles.active : ""} ${o.value === "" ? styles.muted : ""}`}
                        onMouseMove={() => setActive(i)}
                        onClick={() => choose(i)}>
                        <span>{o.label}</span>
                        {isSelected && <AdminIcons.Check width={15} height={15} aria-hidden="true" />}
                    </li>
                );
            })}
        </ul>
    );

    return (
        <div className={styles.select}>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                role="combobox"
                className={`${styles["select-trigger"]} ${aria["aria-invalid"] ? styles.invalid : ""}`}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
                aria-invalid={aria["aria-invalid"]}
                aria-describedby={aria["aria-describedby"]}
                disabled={disabled}
                onClick={() => (open ? close() : openList())}
                onKeyDown={onKeyDown}
                // Space activates buttons on keyup; it's already handled on keydown.
                onKeyUp={(e) => { if (e.key === " ") e.preventDefault(); }}>
                <span className={`${styles["select-value"]} ${selected ? "" : styles.placeholder}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <AdminIcons.ChevronDown width={16} height={16} className={styles["select-chevron"]} aria-hidden="true" />
            </button>

            {list && createPortal(list, triggerRef.current?.closest("dialog") ?? document.body)}
        </div>
    );
}
