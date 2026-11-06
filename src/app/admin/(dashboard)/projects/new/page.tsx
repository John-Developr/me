import type { Metadata } from "next";
import AdminProjectFormPage from "@/containers/admin-project-form-page";

export const metadata: Metadata = {
  title: "New Project",
};

export default function AdminNewProject() {
  return <AdminProjectFormPage />;
}
