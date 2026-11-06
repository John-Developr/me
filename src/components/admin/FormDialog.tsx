'use client'

import { FormEvent, ReactNode, useEffect, useRef } from "react";

import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";

interface FormDialogProps {
    open:      boolean;
    title:     string;
    subtitle?: ReactNode;
    /** Footer buttons (the submit button should be type="submit"). */
    actions:   ReactNode;
    /** Shown at the left of the footer, e.g. a Delete button. */
    footerStart?: ReactNode;
    busy?:     boolean;
    onSubmit:  () => void;
    onClose:   () => void;
    children:  ReactNode;
}

/**
 * Modal form on the native <dialog> (focus trap, Escape, inert page).
 * Enter submits; Escape or the backdrop closes unless busy.
 */
export default function FormDialog({ open, title, subtitle, actions, footerStart, busy, onSubmit, onClose, children }: FormDialogProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        else if (!open && dialog.open) dialog.close();
    }, [open]);

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!busy) onSubmit();
    };

    return (
        <dialog
            ref={ref}
            className={adminStyles["form-dialog"]}
            aria-labelledby="form-dialog-title"
            onCancel={(e) => { e.preventDefault(); if (!busy) onClose(); }}
            onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
            <form onSubmit={submit} noValidate>
                <header className={adminStyles["form-dialog-head"]}>
                    <div>
                        <h2 id="form-dialog-title">{title}</h2>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    <button type="button" className={adminStyles["icon-btn"]} aria-label="Close" onClick={onClose} disabled={busy}>
                        <AdminIcons.Close />
                    </button>
                </header>

                <div className={adminStyles["form-dialog-body"]}>{children}</div>

                <footer className={adminStyles["form-dialog-foot"]}>
                    <div>{footerStart}</div>
                    <div className={adminStyles["form-dialog-actions"]}>{actions}</div>
                </footer>
            </form>
        </dialog>
    );
}
