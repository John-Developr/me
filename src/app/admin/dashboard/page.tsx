import type { Metadata } from "next";
import DashboardPage from "@/containers/admin/dashboard-page/DashboardPage";

export const metadata: Metadata = {
  title: "Dashboard | Lorem Ipsum"
};

export default function AdminDashboard() {
  return <DashboardPage />
}
