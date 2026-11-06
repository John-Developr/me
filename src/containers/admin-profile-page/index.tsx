import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import AdminAuthService from "@/lib/.services/adminAuthService";
import ProfileService from "@/lib/.services/profileService";
import { PortfolioProfile } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";

import ProfileEditor from "./ProfileEditor";

async function loadProfile(): Promise<{ ok: true; data: PortfolioProfile | null } | { ok: false }> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return { ok: false };
        return { ok: true, data: await new ProfileService(session.client).get() };
    } catch {
        return { ok: false };
    }
}

export default async function AdminProfilePage() {
    const profile = await loadProfile();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                <PageHeader
                    title="Personal Profile"
                    description="Your name, bio and contact details on the portfolio home page." />

                {profile.ok
                    ? <ProfileEditor profile={profile.data} />
                    : <ErrorState message="Couldn't load your profile. Check your connection and try again." />}
            </div>
        </DashboardRefreshProvider>
    );
}
