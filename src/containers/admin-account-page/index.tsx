import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import AdminAuthService from "@/lib/.services/adminAuthService";
import AccountService from "@/lib/.services/accountService";
import { AdminAccount } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";

import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";
import { AppearanceCard, DetailsCard, SessionsCard } from "./AccountSidePanels";

async function loadAccount(): Promise<AdminAccount | null> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return null;
        return await new AccountService(session.client).getAccount();
    } catch {
        return null;
    }
}

export default async function AdminAccountPage() {
    const account = await loadAccount();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                <PageHeader title="Account Settings" description="Your admin sign-in, password and preferences." />

                {!account ? (
                    <ErrorState message="Couldn't load your account. Check your connection and try again." />
                ) : (
                    <div className={`${formStyles.form} ${formStyles.balanced}`}>
                        <div className={formStyles["form-main"]}>
                            <ProfileForm email={account.email} displayName={account.displayName} />
                            <PasswordForm email={account.email} />
                        </div>
                        <aside className={formStyles["form-side"]}>
                            <AppearanceCard />
                            <SessionsCard lastSignInAt={account.lastSignInAt} />
                            <DetailsCard account={account} />
                        </aside>
                    </div>
                )}
            </div>
        </DashboardRefreshProvider>
    );
}
