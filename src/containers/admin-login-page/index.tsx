'use client'

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import styles from "@/styles/pages/admin.module.css";

interface AdminLoginPageProps {
    /** Where to go after signing in (already validated server-side). */
    next:    string;
    /** Message shown on load, e.g. a signed-in account without admin access. */
    notice?: string;
    /** Signed in but not an admin: offer to sign out and switch accounts. */
    signedInWithoutAccess?: boolean;
}

export default function AdminLoginPage({ next, notice, signedInWithoutAccess }: AdminLoginPageProps) {
    const router = useRouter();

    const [email,     setEmail]     = useState<string>("");
    const [password,  setPassword]  = useState<string>("");
    const [error,     setError]     = useState<string>(notice ?? "");
    const [submitting, setSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting) return;

        if (!email.trim() || !password) {
            setError("Enter your email and password.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const res  = await fetch(networkDefine.ADMIN_LOGIN_API, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email: email.trim(), password }),
            });
            const json = await res.json().catch(() => null);

            if (!res.ok || !json?.result) {
                setError(json?.message ?? "Couldn't sign in. Please try again.");
                setSubmitting(false);
                return;
            }

            router.replace(next);
            router.refresh();
        } catch {
            setError("Network error. Check your connection and try again.");
            setSubmitting(false);
        }
    };

    const handleSwitchAccount = async () => {
        await fetch(networkDefine.ADMIN_LOGOUT_API, { method: "POST" }).catch(() => null);
        setError("");
        router.refresh();
    };

    return (
        <div className={styles.login}>
            <form className={styles["login-card"]} onSubmit={handleSubmit} noValidate>
                <div className={styles["login-head"]}>
                    <h1>Sign in to Portfolio CMS</h1>
                    <p>Admin access only.</p>
                </div>

                {error && (
                    <p className={styles["login-error"]} role="alert">
                        <AdminIcons.AlertCircle width={16} height={16} />
                        {error}
                    </p>
                )}

                {signedInWithoutAccess ? (
                    <button type="button" className={`liquid_glass_btn ${styles["btn-primary"]}`} onClick={handleSwitchAccount}>
                        <AdminIcons.LogOut width={16} height={16} />
                        Sign out and use another account
                    </button>
                ) : (
                    <>
                        <label className={styles.field}>
                            <span>Email</span>
                            <input
                                type="email"
                                name="email"
                                autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus />
                        </label>

                        <label className={styles.field}>
                            <span>Password</span>
                            <input
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                        </label>

                        <button type="submit" className={`liquid_glass_btn ${styles["btn-primary"]}`} disabled={submitting}>
                            <AdminIcons.Lock width={16} height={16} />
                            {submitting ? "Signing in…" : "Sign in"}
                        </button>
                    </>
                )}

                <Link href="/" className={styles["login-back"]}>← Back to portfolio</Link>
            </form>
        </div>
    );
}
