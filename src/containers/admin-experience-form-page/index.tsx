import { notFound } from "next/navigation";

import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import AdminAuthService from "@/lib/.services/adminAuthService";
import ExperienceService from "@/lib/.services/experienceService";
import { ExperienceRecord } from "@/utils/types";
import { EXPERIENCE_SCREENS, ExperienceScreen } from "@/utils/admin/experienceSchema";
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

interface AdminExperienceFormPageProps {
    id?:     string;
    screen?: ExperienceScreen;   // "education": only education entries can be opened here
}

export default async function AdminExperienceFormPage({ id, screen = "experience" }: AdminExperienceFormPageProps) {
    if (id !== undefined && !UUID.test(id)) notFound();
    const fixedType = EXPERIENCE_SCREENS[screen].type;

    let entry:     ExperienceRecord | undefined;
    let companies: KnownCompany[] = [];
    let failed  = false;
    let missing = false;

    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") throw new Error("Not authorized.");

        const all   = await new ExperienceService(session.client).list();
        const scope = fixedType ? all.filter((e) => e.entry_type === fixedType) : all;
        companies = toCompanies(scope);

        if (id) {
            entry   = scope.find((e) => e.id === id);
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
                    title={entry ? `Edit “${entry.position}”` : fixedType ? "Add Education" : "Add Experience"}
                    description="Saved changes appear on your home page right away." />

                {failed
                    ? <ErrorState message="Couldn't load this entry. Check your connection and try again." />
                    : <ExperienceForm key={entry?.id ?? "new"} entry={entry} companies={companies} screen={screen} />}
            </div>
        </DashboardRefreshProvider>
    );
}
