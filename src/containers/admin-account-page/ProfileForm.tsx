'use client'

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import DashboardCard from "@/components/admin/DashboardCard";
import FormField from "@/components/admin/FormField";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { displayNameSchema } from "@/utils/admin/accountSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";
import styles from "@/styles/pages/adminAccount.module.css";

import { sendJson } from "@/utils/admin/sendJson";

interface ProfileFormProps {
    email:       string;
    displayName: string | null;
}

/** Display name (editable) and sign-in email (read-only). */
export default function ProfileForm({ email, displayName }: ProfileFormProps) {
    const router = useRouter();

    const [name,   setName]   = useState<string>(displayName ?? "");
    const [saved,  setSaved]  = useState<string>(displayName ?? "");
    const [error,  setError]  = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);

    const isDirty = name.trim() !== saved;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const parsed = displayNameSchema.safeParse({ displayName: name });
        if (!parsed.success) {
            setError(toFieldErrors(parsed.error).displayName ?? "Enter a name.");
            return;
        }

        setSaving(true);
        const res = await sendJson(networkDefine.ADMIN_ACCOUNT_API, "PATCH", parsed.data);
        setSaving(false);

        if (!res.result) {
            setError(res.errors?.displayName ?? "");
            sileo.error({ title: "Couldn't update your name", description: res.message });
            return;
        }

        setName(parsed.data.displayName);
        setSaved(parsed.data.displayName);
        sileo.success({ title: "Name updated", description: parsed.data.displayName });
        router.refresh(); // greeting, menu initials
    };

    return (
        <DashboardCard title="Profile" icon={AdminIcons.User} subtitle="How you appear inside the admin.">
            <form className={formStyles.fields} onSubmit={handleSubmit} noValidate>
                <FormField
                    id="displayName"
                    label="Display name"
                    required
                    error={error}
                    hint="Used in the dashboard greeting and the account menu.">
                    <input
                        id="field-displayName"
                        value={name}
                        maxLength={80}
                        autoComplete="name"
                        aria-invalid={!!error || undefined}
                        aria-describedby={error ? "field-displayName-error" : undefined}
                        onChange={(e) => { setName(e.target.value); setError(""); }} />
                </FormField>

                <FormField
                    id="email"
                    label="Email"
                    hint={<>Your sign-in email. To change it, update the user in Supabase → Authentication → Users.</>}>
                    <input id="field-email" value={email} readOnly disabled />
                </FormField>

                <div className={styles["form-actions"]}>
                    <button
                        type="submit"
                        className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}
                        disabled={saving || !isDirty}>
                        {saving ? "Saving…" : "Save name"}
                    </button>
                </div>
            </form>
        </DashboardCard>
    );
}
