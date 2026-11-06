'use client'

import { FormEvent, useState } from "react";
import { sileo } from "sileo";

import DashboardCard from "@/components/admin/DashboardCard";
import FormField from "@/components/admin/FormField";
import PasswordInput from "@/components/admin/PasswordInput";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { PASSWORD_MAX, PASSWORD_MIN, passwordChangeSchema } from "@/utils/admin/accountSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";
import styles from "@/styles/pages/adminAccount.module.css";

import { sendJson } from "@/utils/admin/sendJson";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

const EMPTY: Record<PasswordField, string> = { currentPassword: "", newPassword: "", confirmPassword: "" };

/** Change password: current password required; optionally signs out other devices. */
export default function PasswordForm({ email }: { email: string }) {
    const [values,        setValues]        = useState<Record<PasswordField, string>>(EMPTY);
    const [signOutOthers, setSignOutOthers] = useState<boolean>(true);
    const [errors,        setErrors]        = useState<Record<string, string>>({});
    const [saving,        setSaving]        = useState<boolean>(false);

    const field = (key: PasswordField, autoComplete: string) => ({
        id:                 `field-${key}`,
        name:               key,
        value:              values[key],
        autoComplete,
        maxLength:          key === "currentPassword" ? 200 : PASSWORD_MAX,
        "aria-invalid":     !!errors[key] || undefined,
        "aria-describedby": errors[key] ? `field-${key}-error` : undefined,
        onChange:           (e: { target: { value: string } }) => {
            setValues((prev) => ({ ...prev, [key]: e.target.value }));
            if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
        },
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saving) return;

        const parsed = passwordChangeSchema.safeParse({ ...values, signOutOthers });
        if (!parsed.success) {
            const fieldErrors = toFieldErrors(parsed.error);
            setErrors(fieldErrors);
            document.getElementById(`field-${Object.keys(fieldErrors)[0]}`)?.focus();
            return;
        }

        setSaving(true);
        const res = await sendJson(networkDefine.ADMIN_PASSWORD_API, "POST", parsed.data);
        setSaving(false);

        if (!res.result) {
            if (res.errors) {
                setErrors(res.errors);
                document.getElementById(`field-${Object.keys(res.errors)[0]}`)?.focus();
            }
            sileo.error({ title: "Password not changed", description: res.message });
            return;
        }

        setValues(EMPTY);
        setErrors({});
        sileo.success({ title: "Password changed", description: res.message });
    };

    return (
        <DashboardCard title="Password" icon={AdminIcons.Lock} subtitle="Use a unique password you don't use anywhere else.">
            <form className={formStyles.fields} onSubmit={handleSubmit} noValidate>
                {/* Lets password managers attach the new password to the right account. */}
                <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />

                <FormField id="currentPassword" label="Current password" required error={errors.currentPassword}>
                    <PasswordInput {...field("currentPassword", "current-password")} />
                </FormField>

                <div className={`${formStyles.fields} ${formStyles.two}`}>
                    <FormField
                        id="newPassword"
                        label="New password"
                        required
                        error={errors.newPassword}
                        hint={`At least ${PASSWORD_MIN} characters, with a letter and a number.`}>
                        <PasswordInput {...field("newPassword", "new-password")} />
                    </FormField>

                    <FormField id="confirmPassword" label="Confirm new password" required error={errors.confirmPassword}>
                        <PasswordInput {...field("confirmPassword", "new-password")} />
                    </FormField>
                </div>

                <label className={formStyles.checkbox}>
                    <input type="checkbox" checked={signOutOthers} onChange={(e) => setSignOutOthers(e.target.checked)} />
                    <span>
                        <strong>Sign out other devices</strong>
                        <small>Recommended. Keeps you signed in here only.</small>
                    </span>
                </label>

                <div className={styles["form-actions"]}>
                    <button type="submit" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} disabled={saving}>
                        {saving ? "Changing…" : "Change password"}
                    </button>
                </div>
            </form>
        </DashboardCard>
    );
}
