import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import AdminAuthService from "@/lib/.services/adminAuthService";
import { loadNewMessageCount } from "@/containers/admin-dashboard-page/dashboardData";

// Per-user, per-request data: never statically rendered or cached.
export const dynamic = "force-dynamic";

/**
 * Server-side gate for every admin screen (middleware only checks for a session).
 * Non-admins never receive the dashboard markup.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await AdminAuthService.getSession();

  if (session.status === "signed-out") redirect("/admin/login");
  if (session.status !== "admin")      redirect(`/admin/login?error=${session.status}`);

  const newMessages = await loadNewMessageCount();

  return (
    <AdminShell admin={session.admin} newMessages={newMessages.ok ? newMessages.data : null}>
      {children}
    </AdminShell>
  );
}
