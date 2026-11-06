import { ReactNode } from "react";
import styles from "@/styles/pages/adminForm.module.css";

interface FormFieldProps {
    /** Field name; the control inside must use id `field-${id}`. */
    id:        string;
    label:     string;
    hint?:     ReactNode;
    error?:    string;
    required?: boolean;
    /** Character counter, e.g. { value: 120, max: 5000 }. */
    count?:    { value: number; max: number };
    children:  ReactNode;
}

/**
 * Label + control + hint/error for admin forms. The error replaces the hint
 * and is linked to the control via `field-${id}-error` (aria-describedby).
 */
export default function FormField({ id, label, hint, error, required, count, children }: FormFieldProps) {
    return (
        <div className={`${styles.field} ${error ? styles.invalid : ""}`}>
            <div className={styles["field-label"]}>
                <label htmlFor={`field-${id}`}>
                    {label}{required && <span aria-hidden="true"> *</span>}
                </label>
                {count && (
                    <span className={count.value > count.max ? styles.over : ""}>{count.value}/{count.max}</span>
                )}
            </div>
            {children}
            {error
                ? <p id={`field-${id}-error`} className={styles["field-error"]} role="alert">{error}</p>
                : hint && <p className={styles["field-hint"]}>{hint}</p>}
        </div>
    );
}
