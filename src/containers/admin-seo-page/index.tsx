import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import AdminAuthService from "@/lib/.services/adminAuthService";
import SiteSettingsService from "@/lib/.services/siteSettingsService";
import { ServiceError } from "@/lib/.services/serviceError";
import { SeoSettingsData } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";

import SeoSettingsForm from "./SeoSettingsForm";

async function load(): Promise<{ ok: true; data: SeoSettingsData } | { ok: false; message: string }> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return { ok: false, message: "Not authorized." };
        return { ok: true, data: await new SiteSettingsService(session.client).get() };
    } catch (error) {
        return { ok: false, message: error instanceof ServiceError ? error.message : "Couldn't load SEO settings." };
    }
}

export default async function AdminSeoPage() {
    const settings = await load();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                <PageHeader
                    title="SEO Settings"
                    description="How your site appears in Google, social shares and browser tabs." />

                {settings.ok
                    ? <SeoSettingsForm data={settings.data} />
                    : <ErrorState message={settings.message} />}
            </div>
        </DashboardRefreshProvider>
    );
}
