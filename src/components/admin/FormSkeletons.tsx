import { ReactNode } from "react";

import FormField from "@/components/admin/FormField";
import Skeleton from "@/components/admin/Skeleton";
import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";

/* ============================================================
   FORM SKELETONS
   ------------------------------------------------------------
   Building blocks for the loading.tsx of admin add/edit screens
   (Projects, Blog, Work Experience). Like ListSkeletons, they
   render the REAL labels, hints, radio cards and save bar with
   the form's own classes, and shimmer only where a control's
   value goes, so the form doesn't jump when it arrives.
   ============================================================ */

/** Heights of the form controls, measured in the browser (14px × 1.4 line + 20px padding/border for textareas). */
export const CONTROL_HEIGHT = {
    input:     40,  // inputs, Select, MonthPicker, TagInput
    button:    38,  // ghost/primary buttons, e.g. "Add highlight"
    textarea3: 79,  // rows={3}
    textarea4: 98,  // rows={4}
    textarea5: 118, // rows={5}
} as const;

interface FieldSkeletonProps {
    label:     string;
    note?:     string;
    hint?:     ReactNode;
    required?: boolean;
    /** Control height in px (default: a 40px input). */
    height?:   number;
    /** Custom placeholder instead of the default bar. */
    control?:  ReactNode;
}

/** A FormField with its real label and hint; the control shimmers. */
export function FieldSkeleton({ label, note, hint, required, height = CONTROL_HEIGHT.input, control }: FieldSkeletonProps) {
    return (
        <FormField id={`skeleton-${label}`} label={label} note={note} hint={hint} required={required}>
            {control ?? <Skeleton height={height} radius={8} />}
        </FormField>
    );
}

/** AssetInput footprint: preview box + path input + "Choose" button. */
export function AssetFieldSkeleton({ shape = "square" }: { shape?: "square" | "wide" }) {
    return (
        <div className={formStyles["image-input"]}>
            <Skeleton width={shape === "square" ? 40 : 64} height={40} radius={8} />
            <div className={formStyles["image-field"]}>
                <div className={formStyles["asset-row"]}>
                    <Skeleton height={40} radius={8} />
                    <Skeleton width={96} height={40} radius={10} />
                </div>
            </div>
        </div>
    );
}

interface RadioOption {
    title: string;
    text:  string;
}

/** The real radio cards (first one selected), disabled. */
export function RadiosSkeleton({ options, row = false }: { options: RadioOption[]; row?: boolean }) {
    return (
        <fieldset className={`${formStyles.radios} ${row ? formStyles["radios-row"] : ""}`} disabled>
            {options.map((option, i) => (
                <label key={option.title} className={i === 0 ? formStyles.checked : ""}>
                    <input type="radio" checked={i === 0} readOnly tabIndex={-1} />
                    <span>
                        <strong>{option.title}</strong>
                        <small>{option.text}</small>
                    </span>
                </label>
            ))}
        </fieldset>
    );
}

/** The real checkbox row, disabled and unchecked. */
export function CheckboxSkeleton({ title, text }: RadioOption) {
    return (
        <label className={formStyles.checkbox}>
            <input type="checkbox" disabled tabIndex={-1} />
            <span>
                <strong>{title}</strong>
                <small>{text}</small>
            </span>
        </label>
    );
}

/** "Created / Last saved" list on edit screens; the times shimmer. */
export function MetaSkeleton({ labels }: { labels: string[] }) {
    return (
        <dl className={formStyles.meta}>
            {labels.map((label) => (
                <div key={label}><dt>{label}</dt><dd><Skeleton width={70} height={13} /></dd></div>
            ))}
        </dl>
    );
}

/** Danger zone card body (edit screens): real text, disabled button. */
export function DangerZoneSkeleton({ hint, label }: { hint: string; label: string }) {
    return (
        <>
            <p className={formStyles["field-hint"]}>{hint}</p>
            <button type="button" className={`liquid_glass_btn ${adminStyles["btn-danger"]}`} disabled tabIndex={-1}>
                {label}
            </button>
        </>
    );
}

/** The sticky save bar with its real (disabled) buttons. */
export function SaveBarSkeleton({ edit }: { edit: boolean }) {
    return (
        <div className={formStyles["save-bar"]}>
            <p className={formStyles["save-status"]}>{edit ? "All changes saved" : ""}</p>
            <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} disabled tabIndex={-1}>
                {edit ? "Back" : "Cancel"}
            </button>
            <button type="button" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} disabled tabIndex={-1}>
                <AdminIcons.Check width={15} height={15} />
                {edit ? "Save changes" : "Create draft"}
            </button>
        </div>
    );
}
