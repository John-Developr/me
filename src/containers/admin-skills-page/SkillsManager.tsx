'use client'

import { useMemo, useState } from "react";
import Image from "next/image";

import DashboardCard from "@/components/admin/DashboardCard";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import { AdminIcons } from "@/components/icons/admin";
import { SKILL_ICONS } from "@/components/tech/skillIcons";
import { SkillCategoryRecord, SkillRecord } from "@/utils/types";
import { ADMIN_PAGE_HEADERS } from "@/utils/admin/pageHeaders";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminSkills.module.css";

import CategoryDialog from "./CategoryDialog";
import CoreStackList from "./CoreStackList";
import SkillDialog from "./SkillDialog";

type DialogState =
    | { type: "skill"; skill?: SkillRecord; categoryId?: string | null; core?: boolean }
    | { type: "category"; category?: SkillCategoryRecord }
    | null;

interface SkillsManagerProps {
    categories: SkillCategoryRecord[];
    skills:     SkillRecord[];
}

/** Clickable chip for one skill: logo, name, core star, "right now" dot. */
function SkillChip({ skill, onClick }: { skill: SkillRecord; onClick: () => void }) {
    return (
        <button type="button" className={styles.chip} onClick={onClick} title={`Edit ${skill.name}`}>
            {skill.logo_url && <Image src={skill.logo_url} width={14} height={14} alt="" />}
            {skill.name}
            {skill.is_core    && <span className={styles.core} title="Core Stack" aria-label="Core Stack">★</span>}
            {skill.is_current && <span className={styles.current} title="Using right now" aria-label="Using right now" />}
        </button>
    );
}

export default function SkillsManager({ categories, skills }: SkillsManagerProps) {
    const [dialog, setDialog] = useState<DialogState>(null);
    const [query,  setQuery]  = useState<string>("");

    const q       = query.trim().toLowerCase();
    const matches = (s: SkillRecord) => !q || s.name.toLowerCase().includes(q);

    const core = useMemo(
        () => skills.filter((s) => s.is_core).sort((a, b) => a.core_order - b.core_order || a.name.localeCompare(b.name)),
        [skills],
    );
    const uncategorized = useMemo(() => skills.filter((s) => !s.category_id), [skills]);
    const byCategory    = useMemo(() => {
        const map = new Map<string, SkillRecord[]>();
        for (const s of skills) if (s.category_id) map.set(s.category_id, [...(map.get(s.category_id) ?? []), s]);
        return map;
    }, [skills]);

    const nextCoreOrder     = core.length ? Math.max(...core.map((s) => s.core_order)) + 1 : 0;
    const nextCategoryOrder = categories.length ? Math.max(...categories.map((c) => c.sort_order)) + 1 : 0;
    const editSkill         = (skill: SkillRecord) => setDialog({ type: "skill", skill });

    const visibleCategories = categories.filter((c) => !q || (byCategory.get(c.id) ?? []).some(matches));

    return (
        <>
            <PageHeader
                title={ADMIN_PAGE_HEADERS.skills.title}
                description={ADMIN_PAGE_HEADERS.skills.description}
                actions={<>
                    <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} onClick={() => setDialog({ type: "category" })}>
                        <AdminIcons.Layers width={15} height={15} />
                        New category
                    </button>
                    <button type="button" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} onClick={() => setDialog({ type: "skill" })}>
                        <AdminIcons.Plus width={15} height={15} />
                        New skill
                    </button>
                </>} />

            <div className={styles.toolbar}>
                <p className={styles.summary}>
                    <strong>{skills.length}</strong> skills · <strong>{categories.length}</strong> categories ·{" "}
                    <strong>{core.length}</strong> in Core Stack · <strong>{skills.filter((s) => s.is_current).length}</strong> used right now
                </p>
                <p className={styles.legend}>
                    <span className={styles.core}>★</span> Core Stack <span className={styles.current} /> Right now
                </p>
                <label className={styles.search}>
                    <AdminIcons.Search width={16} height={16} />
                    <input type="search" placeholder="Find a skill" aria-label="Find a skill" value={query} onChange={(e) => setQuery(e.target.value)} />
                </label>
            </div>

            <DashboardCard
                title="Core Stack"
                icon={AdminIcons.Award}
                subtitle="Featured on /tech-stack; the first 8 show on the home page. Drag to reorder."
                actions={
                    <button type="button" className={adminStyles["btn-ghost"]} onClick={() => setDialog({ type: "skill", categoryId: null, core: true })}>
                        <AdminIcons.Plus width={14} height={14} /> Add
                    </button>
                }>
                {core.length === 0 ? (
                    <EmptyState compact icon={AdminIcons.Award} title="No core tools" description="Tick “Core Stack” on a skill to feature it." />
                ) : (
                    <CoreStackList
                        key={core.map((s) => s.id).sort().join()}
                        skills={core}
                        query={q}
                        onEdit={editSkill} />
                )}
            </DashboardCard>

            {categories.length === 0 && uncategorized.length === 0 ? (
                <div className={adminStyles.card}>
                    <EmptyState
                        icon={AdminIcons.Code}
                        title="No skills yet"
                        description={<>Add a category and some skills, or import the current tech stack by running <code>supabase/migrations/20261113000100_skills.sql</code>.</>} />
                </div>
            ) : (
                <div className={styles.grid}>
                    {visibleCategories.map((category) => {
                        const items = (byCategory.get(category.id) ?? []).filter(matches);
                        const Icon  = SKILL_ICONS[category.icon]?.Icon ?? SKILL_ICONS.category.Icon;
                        return (
                            <section key={category.id} className={`${adminStyles.card} ${styles.category}`}>
                                <header className={styles["category-head"]}>
                                    <span className={styles["category-icon"]}><Icon width={18} height={18} aria-hidden="true" /></span>
                                    <div className={styles["category-text"]}>
                                        <h2>{category.name}</h2>
                                        {category.description && <p>{category.description}</p>}
                                    </div>
                                    <span className={styles.count}>{(byCategory.get(category.id) ?? []).length}</span>
                                    <button type="button" className={adminStyles["icon-btn"]} aria-label={`Edit ${category.name}`} onClick={() => setDialog({ type: "category", category })}>
                                        <AdminIcons.Pencil width={15} height={15} />
                                    </button>
                                </header>
                                <div className={styles.chips}>
                                    {items.map((skill) => <SkillChip key={skill.id} skill={skill} onClick={() => editSkill(skill)} />)}
                                    {!q && (
                                        <button type="button" className={`${styles.chip} ${styles.add}`} onClick={() => setDialog({ type: "skill", categoryId: category.id })}>
                                            <AdminIcons.Plus width={13} height={13} /> Add
                                        </button>
                                    )}
                                </div>
                            </section>
                        );
                    })}

                    {uncategorized.filter(matches).length > 0 && (
                        <section className={`${adminStyles.card} ${styles.category}`}>
                            <header className={styles["category-head"]}>
                                <span className={styles["category-icon"]}><AdminIcons.Layers width={18} height={18} /></span>
                                <div className={styles["category-text"]}>
                                    <h2>No category</h2>
                                    <p>Shown only if marked Core Stack or Right now.</p>
                                </div>
                                <span className={styles.count}>{uncategorized.length}</span>
                            </header>
                            <div className={styles.chips}>
                                {uncategorized.filter(matches).map((skill) => <SkillChip key={skill.id} skill={skill} onClick={() => editSkill(skill)} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {q && visibleCategories.length === 0 && core.filter(matches).length === 0 && uncategorized.filter(matches).length === 0 && (
                <EmptyState compact icon={AdminIcons.Search} title="No matching skills" description="Try a different name." />
            )}

            {dialog?.type === "skill" && (
                <SkillDialog
                    key={dialog.skill?.id ?? `new-${dialog.categoryId ?? "none"}`}
                    open
                    skill={dialog.skill}
                    categoryId={dialog.categoryId}
                    defaultCore={dialog.core}
                    categories={categories}
                    nextCoreOrder={nextCoreOrder}
                    onClose={() => setDialog(null)} />
            )}
            {dialog?.type === "category" && (
                <CategoryDialog
                    key={dialog.category?.id ?? "new"}
                    open
                    category={dialog.category}
                    skillCount={dialog.category ? (byCategory.get(dialog.category.id) ?? []).length : 0}
                    nextOrder={nextCategoryOrder}
                    onClose={() => setDialog(null)} />
            )}
        </>
    );
}
