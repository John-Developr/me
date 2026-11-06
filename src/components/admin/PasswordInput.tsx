'use client'

import { InputHTMLAttributes, useState } from "react";

import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";

/** Password field with a show/hide toggle. Takes normal <input> props. */
export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
    const [visible, setVisible] = useState<boolean>(false);

    return (
        <div className={formStyles.password}>
            <input {...props} type={visible ? "text" : "password"} spellCheck={false} />
            <button
                type="button"
                className={adminStyles["icon-btn"]}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                onClick={() => setVisible((v) => !v)}>
                {visible ? <AdminIcons.EyeOff width={16} height={16} /> : <AdminIcons.Eye width={16} height={16} />}
            </button>
        </div>
    );
}
