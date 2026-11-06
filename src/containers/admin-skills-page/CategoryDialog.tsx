'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import FormDialog from "@/components/admin/FormDialog";
import FormField from "@/components/admin/FormField";
import { SKILL_ICONS } from "@/components/tech/skillIcons";
import { networkDefine } from "@/config/networkDefine";
import { categoryInputSchema } from "@/utils/admin/skillSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";
import { sendJson } from "@/utils/admin/sendJson";
import { SKILL_ICON_KEYS, SkillIconKey } from "@/utils/admin/skillIconKeys";
import { SkillCategoryRecord } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";
import styles from "@/styles/pages/adminSkills.module.css";

interface CategoryDialogProps {
    open:       boolean;
    category?:  SkillCategoryRecord;
    skillCount: number;
    nextOrder:  number;
    onClose:    () => void;
}

/** Add or edit a "Full Toolkit." category. */
export default function CategoryDialog({ open, category, skillCount, nextOrder, onClose }: CategoryDialogProps) {
    const router = useRouter();

    const [name,        setName]        = useState<string>(category?.name ?? "");
    const [description, setDescription] = useState<string>(category?.description ?? "");
    const [icon,        setIcon]        = useState<SkillIconKey>(category?.icon ?? "category");
    const [order,       setOrder]       = useState<string>(String(category?.sort_order ?? nextOrder));
    const [errors,      setErrors]      = useState<Record<string, string>>({});
    const [busy,        setBusy]        = useState<boolean>(false);
    const [confirming,  setConfirming]  = useState<boolean>(false);
    const [keepSkills,  setKeepSkills]  = useState<boolean>(true);

    const save = async () => {
        const parsed = categoryInputSchema.safeParse({ name, description, icon, sort_order: order === "" ? 0 : Number(order) });
        if (!parsed.success) {
            const fieldErrors = toFieldErrors(parsed.error);
            setErrors(fieldErrors);
            document.getElementById(`field-${Object.keys(fieldErrors)[0]}`)?.focus();
            return;
        }

        setBusy(true);
        const res = await sendJson(
            category ? networkDefine.ADMIN_SKILL_CATEGORY_API(category.id) : networkDefine.ADMIN_SKILL_CATEGORIES_API,
            category ? "PATCH" : "POST",
            parsed.data,
        );
        setBusy(false);

        if (!res.result) {
            if (res.errors) setErrors(res.errors);
            sileo.error({ title: "Couldn't save category", description: res.message });
            return;
        }

        sileo.success({ title: category ? "Category saved" : "Category added", description: parsed.data.name });
        router.refresh();
        onClose();
    };

    const remove = async () => {
        if (!category) return;
        setBusy(true);
        const res = await sendJson(`${networkDefine.ADMIN_SKILL_CATEGORY_API(category.id)}?keepSkills=${keepSkills ? "1" : "0"}`, "DELETE");
        setBusy(false);
        setConfirming(false);

        if (!res.result) {
            sileo.error({ title: "Couldn't delete category", description: res.message });
            return;
        }
        sileo.success({ title: "Category deleted", description: category.name });
        router.refresh();
        onClose();
    };

    return (
        <FormDialog
            open={open}
            title={category ? `Edit “${category.name}”` : "New category"}
            subtitle={"A card in the “Full Toolkit.” section of /tech-stack."}
            busy={busy}
            onSubmit={save}
            onClose={onClose}
            footerStart={category && (
                <button type="button" className={adminStyles["btn-ghost"]} onClick={() => setConfirming(true)} disabled={busy}>
                    Delete
                </button>
            )}
            actions={<>
                <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} onClick={onClose} disabled={busy}>Cancel</button>
                <button type="submit" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} disabled={busy}>
                    {busy ? "Saving…" : category ? "Save" : "Add category"}
                </button>
            </>}>
            <div className={formStyles.fields}>
                <div className={`${formStyles.fields} ${formStyles.two}`}>
                    <FormField id="name" label="Name" required error={errors.name}>
                        <input id="field-name" value={name} maxLength={80} autoFocus onChange={(e) => { setName(e.target.value); setErrors({}); }} />
                    </FormField>
                    <FormField id="sort_order" label="Display order" error={errors.sort_order} hint="Lower numbers first.">
                        <input id="field-sort_order" type="number" min={0} max={9999} value={order} onChange={(e) => setOrder(e.target.value)} />
                    </FormField>
                </div>

                <FormField id="description" label="Description" error={errors.description} hint="One line about what it covers.">
                    <input id="field-description" value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} />
                </FormField>

                <fieldset className={styles["icon-picker"]}>
                    <legend>Icon</legend>
                    {SKILL_ICON_KEYS.map((key) => {
                        const { Icon, label } = SKILL_ICONS[key];
                        return (
                            <label key={key} className={icon === key ? styles.chosen : ""} title={label}>
                                <input type="radio" name="icon" value={key} checked={icon === key} onChange={() => setIcon(key)} />
                                <Icon width={18} height={18} aria-hidden="true" />
                                <span className={adminStyles["sr-only"]}>{label}</span>
                            </label>
                        );
                    })}
                </fieldset>
            </div>

            <ConfirmDialog
                open={confirming}
                danger
                title="Delete this category?"
                description={<>
                    <strong>{category?.name}</strong> will be removed from /tech-stack.
                    {skillCount > 0 && (
                        <label className={styles["keep-skills"]}>
                            <input type="checkbox" checked={keepSkills} onChange={(e) => setKeepSkills(e.target.checked)} />
                            Keep its {skillCount} skill{skillCount === 1 ? "" : "s"} (they become uncategorized)
                        </label>
                    )}
                </>}
                confirmLabel={keepSkills || skillCount === 0 ? "Delete category" : `Delete category and ${skillCount} skills`}
                busy={busy}
                onConfirm={remove}
                onCancel={() => setConfirming(false)} />
        </FormDialog>
    );
}
