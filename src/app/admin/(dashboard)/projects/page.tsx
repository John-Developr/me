import type { Metadata } from "next";
import AdminProjectsPage from "@/containers/admin-projects-page";

export const metadata: Metadata = {
  title: "Projects",
};

export default function AdminProjects() {
  return <AdminProjectsPage />;
}
