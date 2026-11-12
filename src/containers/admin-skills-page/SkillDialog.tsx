'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import AssetInput from "@/components/admin/AssetInput";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import FormDialog from "@/components/admin/FormDialog";
import FormField from "@/components/admin/FormField";
import Select from "@/components/admin/Select";
import { networkDefine } from "@/config/networkDefine";
import { toFieldErrors } from "@/utils/admin/formErrors";
import { sendJson } from "@/utils/admin/sendJson";
import { skillInputSchema } from "@/utils/admin/skillSchema";
import { SkillCategoryRecord, SkillRecord } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";

interface SkillDialogProps {
    open:       boolean;
    /** Skill to edit; omitted to create. */
    skill?:     SkillRecord;
    /** Pre-selected category when adding from a category card. */
    categoryId?: string | null;
    /** New skill starts as a Core Stack tool (added from the Core Stack card). */
    defaultCore?: boolean;
    categories: SkillCategoryRecord[];
    /** Next Core Stack position, for new core tools. */
    nextCoreOrder: number;
    onClose:    () => void;
}

interface State {
    name: string; category_id: string; logo_url: string;
    is_core: boolean; description: string; core_order: string;
    is_current: boolean; sort_order: string;
}

const fromSkill = (s: SkillRecord | undefined, categoryId: string | null | undefined, nextCoreOrder: number, defaultCore = false): State => ({
    name:        s?.name ?? "",
    category_id: s ? (s.category_id ?? "") : (categoryId ?? ""),
    logo_url:    s?.logo_url ?? "",
    is_core:     s?.is_core ?? defaultCore,
    description: s?.description ?? "",
    core_order:  String(s?.core_order ?? nextCoreOrder),
    is_current:  s?.is_current ?? false,
    sort_order:  String(s?.sort_order ?? 99),
});

/** Add or edit one skill (opens from a chip, a category card, or "New skill"). */
export default function SkillDialog({ open, skill, categoryId, defaultCore, categories, nextCoreOrder, onClose }: SkillDialogProps) {
    const router = useRouter();

    const [values,     setValues]     = useState<State>(() => fromSkill(skill, categoryId, nextCoreOrder, defaultCore));
    const [errors,     setErrors]     = useState<Record<string, string>>({});
    const [busy,       setBusy]       = useState<boolean>(false);
    const [confirming, setConfirming] = useState<boolean>(false);

    const set = <K extends keyof State>(key: K, value: State[K]) => {
        setValues((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const text = (key: "name" | "description" | "core_order" | "sort_order" | "logo_url") => ({
        id:                 `field-${key}`,
        value:              values[key],
        "aria-invalid":     !!errors[key] || undefined,
        "aria-describedby": errors[key] ? `field-${key}-error` : undefined,
        onChange:           (e: { target: { value: string } }) => set(key, e.target.value),
    });

    const save = async () => {
        const payload = {
            ...values,
            core_order: values.core_order === "" ? 0 : Number(values.core_order),
            sort_order: values.sort_order === "" ? 0 : Number(values.sort_order),
        };
        const parsed = skillInputSchema.safeParse(payload);
        if (!parsed.success) {
            const fieldErrors = toFieldErrors(parsed.error);
            setErrors(fieldErrors);
            document.getElementById(`field-${Object.keys(fieldErrors)[0]}`)?.focus();
            return;
        }

        setBusy(true);
        const res = await sendJson(
            skill ? networkDefine.ADMIN_SKILL_API(skill.id) : networkDefine.ADMIN_SKILLS_API,
            skill ? "PATCH" : "POST",
            parsed.data,
        );
        setBusy(false);

        if (!res.result) {
            if (res.errors) setErrors(res.errors);
            sileo.error({ title: "Couldn't save skill", description: res.message });
            return;
        }

        sileo.success({ title: skill ? "Skill saved" : "Skill added", description: parsed.data.name });
        router.refresh();
        onClose();
    };

    const remove = async () => {
        if (!skill) return;
        setBusy(true);
        const res = await sendJson(networkDefine.ADMIN_SKILL_API(skill.id), "DELETE");
        setBusy(false);
        setConfirming(false);

        if (!res.result) {
            sileo.error({ title: "Couldn't delete skill", description: res.message });
            return;
        }
        sileo.success({ title: "Skill deleted", description: skill.name });
        router.refresh();
        onClose();
    };

    return (
        <FormDialog
            open={open}
            title={skill ? `Edit “${skill.name}”` : "New skill"}
            subtitle="Shown on /tech-stack; core tools also appear on the home page."
            busy={busy}
            onSubmit={save}
            onClose={onClose}
            footerStart={skill && (
                <button type="button" className={adminStyles["btn-ghost"]} onClick={() => setConfirming(true)} disabled={busy}>
                    Delete
                </button>
            )}
            actions={<>
                <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} onClick={onClose} disabled={busy}>Cancel</button>
                <button type="submit" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} disabled={busy}>
                    {busy ? "Saving…" : skill ? "Save" : "Add skill"}
                </button>
            </>}>
            <div className={formStyles.fields}>
                <div className={`${formStyles.fields} ${formStyles.two}`}>
                    <FormField id="name" label="Name" required error={errors.name}>
                        <input {...text("name")} maxLength={80} autoFocus />
                    </FormField>
                    <FormField id="category_id" label="Category" error={errors.category_id}>
                        <Select
                            id="field-category_id"
                            value={values.category_id}
                            options={[{ value: "", label: "No category (Core Stack only)" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
                            aria-invalid={!!errors.category_id || undefined}
                            aria-describedby={errors.category_id ? "field-category_id-error" : undefined}
                            onChange={(v) => set("category_id", v)} />
                    </FormField>
                </div>

                <FormField id="logo_url" label="Logo" note="Shown on chips everywhere this tool appears" error={errors.logo_url}>
                    <AssetInput {...text("logo_url")} name="logo_url" shape="square" libraryOnly />
                </FormField>

                <label className={formStyles.checkbox}>
                    <input type="checkbox" checked={values.is_core} onChange={(e) => set("is_core", e.target.checked)} />
                    <span>
                        <strong>Core Stack</strong>
                        <small>Featured on /tech-stack and in the home page Tech Stack card (first 8).</small>
                    </span>
                </label>

                {values.is_core && (
                    <div className={`${formStyles.fields} ${formStyles.two}`}>
                        <FormField id="description" label="One-line description" required error={errors.description} count={{ value: values.description.trim().length, max: 160 }}>
                            <input {...text("description")} maxLength={160} />
                        </FormField>
                        <FormField id="core_order" label="Core order" error={errors.core_order} hint="Lower numbers first. You can also drag items in the Core Stack list.">
                            <input {...text("core_order")} type="number" min={0} max={9999} inputMode="numeric" />
                        </FormField>
                    </div>
                )}

                <label className={formStyles.checkbox}>
                    <input type="checkbox" checked={values.is_current} onChange={(e) => set("is_current", e.target.checked)} />
                    <span>
                        <strong>Using right now</strong>
                        <small>Listed under &ldquo;Right Now&rdquo; on /tech-stack.</small>
                    </span>
                </label>

                <FormField id="sort_order" label="Order in category" error={errors.sort_order} hint="Lower numbers first.">
                    <input {...text("sort_order")} type="number" min={0} max={9999} inputMode="numeric" />
                </FormField>
            </div>

            <ConfirmDialog
                open={confirming}
                danger
                title="Delete this skill?"
                description={<><strong>{skill?.name}</strong> will be removed from your tech stack. Project chips keep the name but lose its logo.</>}
                confirmLabel="Delete skill"
                busy={busy}
                onConfirm={remove}
                onCancel={() => setConfirming(false)} />
        </FormDialog>
    );
}
