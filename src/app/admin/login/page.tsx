import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminLoginPage from "@/containers/admin-login-page";
import AdminAuthService from "@/lib/.services/adminAuthService";
import { safeAdminRedirect } from "@/utils/admin/safeRedirect";

export const metadata: Metadata = {
  title: "Admin Sign In",
};

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function AdminLogin({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const target   = safeAdminRedirect(next);
  const session  = await AdminAuthService.getSession();

  if (session.status === "admin") redirect(target);

  const notice =
    session.status === "forbidden" ? "You're signed in, but this account doesn't have admin access." :
    session.status === "error"     ? session.message :
    undefined;

  return (
    <AdminLoginPage
      next={target}
      notice={notice}
      signedInWithoutAccess={session.status === "forbidden"} />
  );
}
