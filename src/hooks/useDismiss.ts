// hooks/useDismiss.ts
import { RefObject, useEffect } from "react";

/**
 * useDismiss — closes a popover/menu on an outside pointer press or Escape.
 *
 * Uses `pointerdown` (not click) so the check runs before React re-renders
 * anything inside and detaches the pressed element — same approach as ChatAI.
 *
 * @param ref     - Element that counts as "inside" (trigger + popover wrapper)
 * @param open    - Listeners are attached only while open
 * @param onClose - Called on outside press or Escape
 *
 * @example
 * const menuRef = useRef<HTMLDivElement>(null);
 * useDismiss(menuRef, isOpen, () => setIsOpen(false));
 */
export function useDismiss(
    ref: RefObject<HTMLElement | null>,
    open: boolean,
    onClose: () => void,
): void {
    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target as Node | null;
            if (ref.current && target && ref.current.contains(target)) return;
            onClose();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [ref, open, onClose]);
}
