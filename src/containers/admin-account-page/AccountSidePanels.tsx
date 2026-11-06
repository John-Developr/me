'use client'

import { useState } from "react";
import { sileo } from "sileo";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DashboardCard from "@/components/admin/DashboardCard";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { useApp } from "@/lib/.context/AppContext";
import { AdminAccount } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";
import styles from "@/styles/pages/adminAccount.module.css";

import { sendJson } from "@/utils/admin/sendJson";

/** Light/dark choice (same preference as the public site, saved in this browser). */
export function AppearanceCard() {
    const { isDark, toggleTheme } = useApp();

    return (
        <DashboardCard title="Appearance" icon={AdminIcons.Monitor} subtitle="Saved in this browser; also applies to your portfolio.">
            <fieldset className={formStyles.radios}>
                <legend className={adminStyles["sr-only"]}>Theme</legend>
                {([
                    { dark: false, label: "Light", icon: AdminIcons.Sun },
                    { dark: true,  label: "Dark",  icon: AdminIcons.Moon },
                ]).map(({ dark, label, icon: Icon }) => (
                    <label key={label} className={isDark === dark ? formStyles.checked : ""}>
                        <input
                            type="radio"
                            name="theme"
                            checked={isDark === dark}
                            onChange={() => { if (isDark !== dark) toggleTheme(); }} />
                        <span className={styles["theme-option"]}>
                            <Icon width={16} height={16} />
                            <strong>{label}</strong>
                        </span>
                    </label>
                ))}
            </fieldset>
        </DashboardCard>
    );
}

/** Sign out every other browser/device. */
export function SessionsCard({ lastSignInAt }: { lastSignInAt: string | null }) {
    const [confirming, setConfirming] = useState<boolean>(false);
    const [busy,       setBusy]       = useState<boolean>(false);

    const signOutOthers = async () => {
        setBusy(true);
        const res = await sendJson(networkDefine.ADMIN_SIGN_OUT_OTHERS_API, "POST");
        setBusy(false);
        setConfirming(false);

        if (res.result) sileo.success({ title: "Other devices signed out", description: "You're still signed in here." });
        else            sileo.error({ title: "Couldn't sign out other devices", description: res.message });
    };

    return (
        <DashboardCard title="Sessions" icon={AdminIcons.Shield}>
            <p className={formStyles["field-hint"]}>
                Last sign-in: {lastSignInAt ? <TimeAgo iso={lastSignInAt} /> : "unknown"}.
                If you signed in on a shared or lost device, end those sessions here.
            </p>
            <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} onClick={() => setConfirming(true)}>
                <AdminIcons.LogOut width={15} height={15} />
                Sign out other devices
            </button>

            <ConfirmDialog
                open={confirming}
                title="Sign out other devices?"
                description="Every other browser and device signed in to this account will be signed out. You'll stay signed in here."
                confirmLabel="Sign them out"
                busy={busy}
                onConfirm={signOutOthers}
                onCancel={() => setConfirming(false)} />
        </DashboardCard>
    );
}

/** Read-only facts about the account. */
export function DetailsCard({ account }: { account: AdminAccount }) {
    return (
        <DashboardCard title="Account details" icon={AdminIcons.FileText}>
            <dl className={formStyles.meta}>
                <div><dt>Role</dt><dd>Administrator</dd></div>
                <div><dt>Account created</dt><dd><TimeAgo iso={account.createdAt} /></dd></div>
                {account.adminSince && <div><dt>Admin since</dt><dd><TimeAgo iso={account.adminSince} /></dd></div>}
                {account.lastSignInAt && <div><dt>Last sign-in</dt><dd><TimeAgo iso={account.lastSignInAt} /></dd></div>}
            </dl>
            <div className={styles["user-id"]}>
                <span>User ID</span>
                <code title="Your Supabase Auth user id">{account.id}</code>
            </div>
        </DashboardCard>
    );
}
