import type { Metadata } from "next";
import AdminDashboardPage from "@/containers/admin-dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AdminDashboard() {
  return <AdminDashboardPage />;
}
