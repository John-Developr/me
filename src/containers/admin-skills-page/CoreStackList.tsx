'use client'

import { KeyboardEvent, PointerEvent, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { sendJson } from "@/utils/admin/sendJson";
import { SkillRecord } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminSkills.module.css";

/* ============================================================
   CORE STACK LIST (drag and drop)
   ------------------------------------------------------------
   Drag an item by its grip (mouse or touch, via pointer events)
   or focus the grip and use the arrow keys / Home / End. The new
   order shows at once and is saved to PUT core-order: on drop,
   or 600ms after the last key press. While a save runs, a toast
   shows a progress bar and all grips are locked; a failed save
   puts the last saved order back. Rows slide to
   their new places (FLIP with the Web Animations API) and the
   dragged row follows the pointer, then settles into its slot.
   Reordering is off while the search box filters the list. The
   parent remounts it only when skills join/leave the Core Stack;
   other server order changes sync in when no drag/save is running.
   ============================================================ */

/** Home page shows this many Core Stack tools. */
const HOME_COUNT = 8;
const KEY_SAVE_DELAY = 600;
/** Slide when rows trade places / the dragged row settles. */
const SLIDE_MS = 220;
const EASE     = "cubic-bezier(0.2, 0, 0, 1)";

interface CoreStackListProps {
    /** Core Stack skills, already sorted by core_order. */
    skills: SkillRecord[];
    /** Lower-cased search text ("" = no filter). */
    query:  string;
    onEdit: (skill: SkillRecord) => void;
}

const move = (ids: string[], id: string, to: number): string[] => {
    const from = ids.indexOf(id);
    if (from < 0 || to < 0 || to >= ids.length || from === to) return ids;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, id);
    return next;
};

export default function CoreStackList({ skills, query, onEdit }: CoreStackListProps) {
    const router = useRouter();
    const hintId = useId();

    const [order,    setOrder]    = useState<string[]>(() => skills.map((s) => s.id));
    const [dragId,   setDragId]   = useState<string | null>(null);
    const [announce, setAnnounce] = useState<string>("");
    /** A save request is running: every grip is locked until it finishes. */
    const [saving,   setSaving]   = useState<boolean>(false);

    const orderRef = useRef<string[]>(order);
    const savedRef = useRef<string[]>(order);          // last order the server confirmed
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const pendRef  = useRef<boolean>(false);           // a scheduled save hasn't run yet
    const busyRef  = useRef<boolean>(false);           // same as `saving`, readable from effects/handlers
    const itemRefs = useRef(new Map<string, HTMLLIElement>());
    const listRef  = useRef<HTMLOListElement>(null);

    useEffect(() => { orderRef.current = order; }, [order]);
    // The parent remounts this list only when skills join or leave the Core
    // Stack; send a save that was still waiting instead of dropping it.
    useEffect(() => () => {
        clearTimeout(timerRef.current);
        if (pendRef.current) save(orderRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Take the server's order when it changes from elsewhere (e.g. the skill
    // dialog's Core order field), but never in the middle of a drag or save:
    // our own saves already match it, and resetting then is what caused lag.
    const serverOrder = skills.map((s) => s.id).join();
    useEffect(() => {
        if (dragRef.current || pendRef.current || busyRef.current) return;
        const fresh = serverOrder.split(",").filter(Boolean);
        savedRef.current = fresh;
        setOrder((prev) => (prev.join() === serverOrder ? prev : fresh));
    }, [serverOrder]);

    const byId    = useMemo(() => new Map(skills.map((s) => [s.id, s])), [skills]);
    const ordered = order.map((id) => byId.get(id)).filter((s): s is SkillRecord => !!s);
    const visible = query ? ordered.filter((s) => s.name.toLowerCase().includes(query)) : ordered;
    const canDrag = !query && ordered.length > 1;

    /**
     * Saves the order. While the request runs, a toast shows a progress bar
     * and every grip is locked; it becomes "saved" (then the page refreshes)
     * or an error (and the last saved order comes back).
     */
    const save = (next: string[]) => {
        if (busyRef.current || next.join() === savedRef.current.join()) return;
        busyRef.current = true;
        setSaving(true);

        const request = sendJson(networkDefine.ADMIN_SKILLS_CORE_ORDER_API, "PUT", { ids: next }).then((res) => {
            if (!res.result) throw new Error(res.message);
            return res;
        });

        sileo.promise(request, {
            loading: {
                title:       "Saving Core Stack order…",
                description: <span className={styles["save-progress"]} role="progressbar" aria-label="Saving"><span /></span>,
            },
            success: { title: "Core Stack order saved" },
            error:   (err) => ({ title: "Couldn't save the order", description: err instanceof Error ? err.message : "Please try again." }),
        }).catch(() => { /* shown in the toast */ });

        request
            .then(() => { savedRef.current = next; router.refresh(); })
            .catch(() => setOrder(savedRef.current))
            .finally(() => { busyRef.current = false; setSaving(false); });
    };

    const scheduleSave = (next: string[], delay: number) => {
        clearTimeout(timerRef.current);
        pendRef.current  = true;
        timerRef.current = setTimeout(() => { pendRef.current = false; save(next); }, delay);
    };

    const nameOf = (id: string) => byId.get(id)?.name ?? "Skill";

    // ─── Motion ──────────────────────────────────────────────
    // Positions are layout offsets (offsetLeft/Top inside the relative <ol>),
    // which transforms don't affect, so running animations never confuse them.

    /** Where the dragged row's slot was when the drag started, and where the pointer is. */
    const dragRef = useRef<{ id: string; startX: number; startY: number; slotX: number; slotY: number; x: number; y: number } | null>(null);
    const posRef  = useRef(new Map<string, { x: number; y: number }>());

    /** Offset that keeps the dragged row under the pointer, relative to its current slot. */
    const dragOffset = (el: HTMLElement) => {
        const d = dragRef.current!;
        return { x: d.x - d.startX - (el.offsetLeft - d.slotX), y: d.y - d.startY - (el.offsetTop - d.slotY) };
    };

    // After each render: rows whose slot changed slide from where they were
    // (FLIP, picking up mid-animation positions); the dragged row stays under the pointer.
    useLayoutEffect(() => {
        const list   = listRef.current;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!list) return;
        const listBox = list.getBoundingClientRect();

        for (const [id, el] of itemRefs.current) {
            const now    = { x: el.offsetLeft, y: el.offsetTop };
            const before = posRef.current.get(id);
            posRef.current.set(id, now);

            if (dragRef.current?.id === id) {
                const o = dragOffset(el);
                el.style.transform = `translate(${o.x}px, ${o.y}px)`;
            } else if (before && (before.x !== now.x || before.y !== now.y) && !reduce) {
                // Current on-screen shift from a running animation (0 if none).
                const box  = el.getBoundingClientRect();
                const live = { x: box.left - listBox.left - now.x, y: box.top - listBox.top - now.y };
                el.getAnimations().forEach((a) => a.cancel());
                el.animate(
                    [{ transform: `translate(${before.x - now.x + live.x}px, ${before.y - now.y + live.y}px)` }, { transform: "none" }],
                    { duration: SLIDE_MS, easing: EASE },
                );
            }
        }
    });

    // ─── Pointer (mouse + touch) ─────────────────────────────

    // Move/up are listened to on window, not the grip: React moves the row's
    // element when rows swap, which drops pointer capture, so grip listeners
    // missed events on fast drags (lag) or missed the release (stuck drag).
    // Moves are applied once per animation frame.
    const frameRef   = useRef<number>(0);
    const unlistenRef = useRef<(() => void) | null>(null);

    useEffect(() => () => unlistenRef.current?.(), []);

    /** Apply the latest pointer position: move the lifted row, swap if over another slot. */
    const applyDrag = () => {
        frameRef.current = 0;
        const d    = dragRef.current;
        const el   = d && itemRefs.current.get(d.id);
        const list = listRef.current;
        if (!d || !el || !list) return;

        const o = dragOffset(el);
        el.style.transform = `translate(${o.x}px, ${o.y}px)`;

        // Swap with the row whose slot (layout box, not its animated position) is under the pointer.
        const box = list.getBoundingClientRect();
        const px  = d.x - box.left;
        const py  = d.y - box.top;
        for (const [id, other] of itemRefs.current) {
            if (id === d.id) continue;
            if (px >= other.offsetLeft && px <= other.offsetLeft + other.offsetWidth &&
                py >= other.offsetTop  && py <= other.offsetTop + other.offsetHeight) {
                setOrder((prev) => move(prev, d.id, prev.indexOf(id)));
                break;
            }
        }
    };

    const endDrag = () => {
        unlistenRef.current?.();
        const d = dragRef.current;
        if (!d) return;
        const el = itemRefs.current.get(d.id);

        // Settle into the slot from wherever it was dropped.
        if (el) {
            const o = dragOffset(el);
            el.style.transform = "";
            el.animate([{ transform: `translate(${o.x}px, ${o.y}px)` }, { transform: "none" }], { duration: SLIDE_MS, easing: EASE });
        }

        dragRef.current = null;
        const position = orderRef.current.indexOf(d.id) + 1;
        setAnnounce(`${nameOf(d.id)} moved to position ${position} of ${orderRef.current.length}.`);
        setDragId(null);
        scheduleSave(orderRef.current, 0);
    };

    const onPointerDown = (e: PointerEvent<HTMLButtonElement>, id: string) => {
        const el = itemRefs.current.get(id);
        if (!canDrag || saving || dragRef.current || e.button !== 0 || !el) return;
        e.preventDefault();
        clearTimeout(timerRef.current);
        pendRef.current = false;
        el.getAnimations().forEach((a) => a.cancel());
        dragRef.current = { id, startX: e.clientX, startY: e.clientY, slotX: el.offsetLeft, slotY: el.offsetTop, x: e.clientX, y: e.clientY };
        setDragId(id);

        const pointerId = e.pointerId;
        const onMove = (ev: globalThis.PointerEvent) => {
            const d = dragRef.current;
            if (ev.pointerId !== pointerId || !d) return;
            d.x = ev.clientX;
            d.y = ev.clientY;
            if (!frameRef.current) frameRef.current = requestAnimationFrame(applyDrag);
        };
        const onEnd = (ev: globalThis.PointerEvent) => { if (ev.pointerId === pointerId) endDrag(); };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onEnd);
        window.addEventListener("pointercancel", onEnd);
        unlistenRef.current = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onEnd);
            window.removeEventListener("pointercancel", onEnd);
            cancelAnimationFrame(frameRef.current);
            frameRef.current  = 0;
            unlistenRef.current = null;
        };
    };

    // ─── Keyboard ────────────────────────────────────────────

    const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
        if (!canDrag || saving) return;
        const from = order.indexOf(id);
        const to =
            e.key === "ArrowUp"   || e.key === "ArrowLeft"  ? from - 1 :
            e.key === "ArrowDown" || e.key === "ArrowRight" ? from + 1 :
            e.key === "Home" ? 0 :
            e.key === "End"  ? order.length - 1 : null;
        if (to === null) return;

        e.preventDefault();
        const next = move(order, id, to);
        if (next === order) return;
        setOrder(next);
        setAnnounce(`${nameOf(id)} moved to position ${next.indexOf(id) + 1} of ${next.length}.`);
        scheduleSave(next, KEY_SAVE_DELAY);
    };

    return (
        <>
            <ol ref={listRef} className={`${styles["core-list"]} ${dragId ? styles.reordering : ""}`} aria-busy={saving}>
                {visible.map((skill) => {
                    const position = order.indexOf(skill.id);
                    return (
                        <li
                            key={skill.id}
                            ref={(el) => { if (el) itemRefs.current.set(skill.id, el); else itemRefs.current.delete(skill.id); }}
                            className={`${styles["core-row"]} ${dragId === skill.id ? styles.dragging : ""}`}>
                            {canDrag && (
                                <button
                                    type="button"
                                    className={styles["core-handle"]}
                                    aria-disabled={saving || undefined}
                                    title={saving ? "Saving the order…" : undefined}
                                    aria-label={`Reorder ${skill.name} (position ${position + 1} of ${order.length})`}
                                    aria-describedby={hintId}
                                    onPointerDown={(e) => onPointerDown(e, skill.id)}
                                    onKeyDown={(e) => onKeyDown(e, skill.id)}>
                                    <AdminIcons.GripVertical width={16} height={16} />
                                </button>
                            )}
                            <button type="button" className={styles["core-item"]} onClick={() => onEdit(skill)}>
                                <span className={styles["core-rank"]}>{position + 1}</span>
                                <span className={styles["core-logo"]} aria-hidden="true">
                                    {skill.logo_url
                                        ? <Image src={skill.logo_url} width={24} height={24} alt="" />
                                        : <AdminIcons.Code width={16} height={16} />}
                                </span>
                                <span className={styles["core-text"]}>
                                    <strong>{skill.name}</strong>
                                    <small>{skill.description}</small>
                                </span>
                                {position < HOME_COUNT && <span className={styles["home-badge"]} title="Shown on the home page">Home</span>}
                            </button>
                        </li>
                    );
                })}
            </ol>

            <p id={hintId} className={adminStyles["sr-only"]}>Drag, or press the arrow keys, to change the order. It saves automatically.</p>
            <p className={adminStyles["sr-only"]} aria-live="polite">{saving ? `${announce} Saving…` : announce}</p>
        </>
    );
}
