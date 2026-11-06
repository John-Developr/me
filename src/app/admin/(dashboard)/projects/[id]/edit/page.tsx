import type { Metadata } from "next";
import AdminProjectFormPage from "@/containers/admin-project-form-page";

export const metadata: Metadata = {
  title: "Edit Project",
};

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProject({ params }: EditProjectPageProps) {
  const { id } = await params;
  return <AdminProjectFormPage id={id} />;
}
