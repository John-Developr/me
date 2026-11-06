'use client'

import { ReactNode, useEffect, useRef } from "react";

import { AdminIcons } from "@/components/icons/admin";
import styles from "@/styles/pages/admin.module.css";

interface ConfirmDialogProps {
    open:          boolean;
    title:         string;
    description:   ReactNode;
    confirmLabel:  string;
    /** Destructive actions get the danger button. */
    danger?:       boolean;
    busy?:         boolean;
    onConfirm:     () => void;
    onCancel:      () => void;
}

/**
 * Modal confirmation built on the native <dialog> (focus trap, Escape and
 * inert background come from the browser). Focus starts on Cancel so
 * Enter never confirms a destructive action by accident.
 */
export default function ConfirmDialog({
    open, title, description, confirmLabel, danger, busy, onConfirm, onCancel,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
            cancelRef.current?.focus();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            aria-labelledby="confirm-dialog-title"
            onCancel={(e) => { e.preventDefault(); if (!busy) onCancel(); }}
            onClick={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
            <div className={styles["dialog-body"]}>
                {danger && (
                    <span className={styles["dialog-icon"]}><AdminIcons.AlertCircle width={20} height={20} /></span>
                )}
                <div>
                    <h2 id="confirm-dialog-title">{title}</h2>
                    <div className={styles["dialog-text"]}>{description}</div>
                </div>
            </div>

            <div className={styles["dialog-actions"]}>
                <button ref={cancelRef} type="button" className={`liquid_glass_btn ${styles["btn-secondary"]}`} onClick={onCancel} disabled={busy}>
                    Cancel
                </button>
                <button
                    type="button"
                    className={`liquid_glass_btn ${danger ? styles["btn-danger"] : styles["btn-primary"]}`}
                    onClick={onConfirm}
                    disabled={busy}>
                    {busy ? "Working…" : confirmLabel}
                </button>
            </div>
        </dialog>
    );
}
