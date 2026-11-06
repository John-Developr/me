import { notFound } from "next/navigation";

import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import AdminAuthService from "@/lib/.services/adminAuthService";
import ExperienceService from "@/lib/.services/experienceService";
import { ExperienceRecord } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";

import ExperienceForm, { KnownCompany } from "./ExperienceForm";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Distinct company names (with a logo, if any) for the name suggestions. */
const toCompanies = (entries: ExperienceRecord[]): KnownCompany[] => {
    const map = new Map<string, KnownCompany>();
    for (const e of entries) {
        const key = e.company.trim().toLowerCase();
        const prev = map.get(key);
        if (!prev || (!prev.logo && e.logo_url)) map.set(key, { name: e.company, logo: e.logo_url });
    }
    return [...map.values()];
};

export default async function AdminExperienceFormPage({ id }: { id?: string }) {
    if (id !== undefined && !UUID.test(id)) notFound();

    let entry:     ExperienceRecord | undefined;
    let companies: KnownCompany[] = [];
    let failed  = false;
    let missing = false;

    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") throw new Error("Not authorized.");

        const all = await new ExperienceService(session.client).list();
        companies = toCompanies(all);

        if (id) {
            entry   = all.find((e) => e.id === id);
            missing = !entry;
        }
    } catch {
        failed = true;
    }

    if (missing) notFound();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                <PageHeader
                    title={entry ? `Edit “${entry.position}”` : "Add Experience"}
                    description="Saved changes appear on your home page right away." />

                {failed
                    ? <ErrorState message="Couldn't load this entry. Check your connection and try again." />
                    : <ExperienceForm key={entry?.id ?? "new"} entry={entry} companies={companies} />}
            </div>
        </DashboardRefreshProvider>
    );
}
