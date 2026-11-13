'use client'

import { KeyboardEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ADMIN_NAV_ITEMS } from "./adminNav";
import { useDebounce } from "@/hooks/useDebounce";
import { useDismiss } from "@/hooks/useDismiss";
import { AdminIconComponent, AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { AdminApiResponse } from "@/utils/admin/sendJson";
import { toSearchTerm } from "@/utils/admin/searchTerm";
import { AdminSearchKind, AdminSearchResult } from "@/utils/types";
import styles from "@/styles/pages/admin.module.css";

// ─── Result groups ───────────────────────────────────────────

const KIND_META: Record<AdminSearchKind, { group: string; icon: AdminIconComponent }> = {
    project:    { group: "Projects",        icon: AdminIcons.Folder },
    blog:       { group: "Blog posts",      icon: AdminIcons.FileText },
    experience: { group: "Work experience", icon: AdminIcons.Briefcase },
    skill:      { group: "Skills",          icon: AdminIcons.Code },
    message:    { group: "Messages",        icon: AdminIcons.Mail },
    media:      { group: "Media",           icon: AdminIcons.Image },
};

/** One row in the dropdown: an admin screen or a content hit. */
interface SearchOption {
    key:   string;
    group: string;
    title: string;
    hint:  string | null;
    href:  string;
    icon:  AdminIconComponent;
}

type ContentState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error" }
    | { status: "done"; results: AdminSearchResult[] };

/**
 * Topbar search (Ctrl/⌘ + K). Matches admin screens by name instantly and
 * content (projects, posts, experience, skills, messages, media) through
 * `GET /api/admin/search`. Arrow keys move, Enter opens, Escape closes.
 */
export default function AdminSearch() {
    const router   = useRouter();
    const pathname = usePathname();
    const listId   = useId();
    const rootRef  = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const [query,   setQuery]   = useState<string>("");
    const [open,    setOpen]    = useState<boolean>(false);
    const [active,  setActive]  = useState<number>(0);
    const [content, setContent] = useState<ContentState>({ status: "idle" });

    const close = useCallback(() => setOpen(false), []);
    useDismiss(rootRef, open, close);

    // Ctrl/⌘ + K focuses the search from anywhere in the admin.
    useEffect(() => {
        const onKeyDown = (e: globalThis.KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                inputRef.current?.focus();
                inputRef.current?.select();
                setOpen(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    // Navigating anywhere closes the dropdown.
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Content search, debounced; a newer query cancels the older request.
    const term = toSearchTerm(query);

    useEffect(() => {
        abortRef.current?.abort();
        setContent(term ? { status: "loading" } : { status: "idle" });
    }, [term]);

    useDebounce(() => {
        if (!term) return;

        const controller = new AbortController();
        abortRef.current = controller;

        fetch(`${networkDefine.ADMIN_SEARCH_API}?q=${encodeURIComponent(term)}`, { signal: controller.signal })
            .then(async (res) => {
                const json = (await res.json().catch(() => null)) as AdminApiResponse<AdminSearchResult[]> | null;
                if (!res.ok || !json?.result) throw new Error(json?.message ?? `Search failed (${res.status})`);
                setContent({ status: "done", results: json.data ?? [] });
            })
            .catch(() => {
                if (!controller.signal.aborted) setContent({ status: "error" });
            });
    }, [term], 250);

    const options = useMemo<SearchOption[]>(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        const pages: SearchOption[] = ADMIN_NAV_ITEMS
            .filter((item) => item.kind === "route" && item.label.toLowerCase().includes(q))
            .map((item) => ({
                key:   `page-${item.key}`,
                group: "Pages",
                title: item.label,
                hint:  null,
                href:  item.kind === "route" ? item.href : "",
                icon:  item.icon,
            }));

        const hits: SearchOption[] = content.status === "done"
            ? content.results.map((r) => ({
                key:   `${r.kind}-${r.id}`,
                group: KIND_META[r.kind].group,
                title: r.title,
                hint:  r.hint,
                href:  r.href,
                icon:  KIND_META[r.kind].icon,
            }))
            : [];

        return [...pages, ...hits];
    }, [query, content]);

    // Keep the highlighted row valid as results change.
    useEffect(() => {
        setActive(0);
    }, [options]);

    const go = (option: SearchOption) => {
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
        router.push(option.href);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
            return;
        }
        if (!options.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => (i + 1) % options.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + options.length) % options.length);
        } else if (e.key === "Enter" && open) {
            e.preventDefault();
            go(options[active]);
        }
    };

    const showPanel = open && query.trim().length > 0;
    const optionId  = (index: number) => `${listId}-option-${index}`;

    return (
        <div ref={rootRef} className={styles.search}>
            <AdminIcons.Search width={16} height={16} />
            <input
                ref={inputRef}
                type="search"
                role="combobox"
                placeholder="Search projects, posts, messages…"
                aria-label="Search the admin"
                aria-autocomplete="list"
                aria-expanded={showPanel}
                aria-controls={listId}
                aria-activedescendant={showPanel && options.length ? optionId(active) : undefined}
                autoComplete="off"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown} />
            <kbd className={styles["search-kbd"]} aria-hidden="true">Ctrl K</kbd>

            {showPanel && (
                <div className={`${styles["popover-panel"]} ${styles["search-panel"]}`}>
                    <ul id={listId} role="listbox" aria-label="Search results" className={styles["search-list"]}>
                        {options.map((option, index) => {
                            const Icon     = option.icon;
                            const newGroup = index === 0 || options[index - 1].group !== option.group;
                            return (
                                <li key={option.key} role="presentation">
                                    {newGroup && <p className={styles["search-group"]} aria-hidden="true">{option.group}</p>}
                                    <div
                                        id={optionId(index)}
                                        role="option"
                                        aria-selected={index === active}
                                        className={styles["search-option"]}
                                        onPointerMove={() => setActive(index)}
                                        onClick={() => go(option)}>
                                        <span className={styles["notif-icon"]}><Icon width={16} height={16} /></span>
                                        <span className={styles["search-text"]}>
                                            <strong>{option.title}</strong>
                                            {option.hint && <small>{option.hint}</small>}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {content.status === "loading" && <p className={styles["popover-empty"]}>Searching…</p>}
                    {content.status === "error" && <p className={styles["popover-empty"]}>Couldn&apos;t search right now. Try again.</p>}
                    {content.status !== "loading" && content.status !== "error" && !options.length && (
                        <p className={styles["popover-empty"]}>
                            {term ? <>No results for &ldquo;{query.trim()}&rdquo;.</> : "Keep typing to search content."}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
