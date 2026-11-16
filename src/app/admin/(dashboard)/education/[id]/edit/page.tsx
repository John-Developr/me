import type { Metadata } from "next";
import AdminExperienceFormPage from "@/containers/admin-experience-form-page";

export const metadata: Metadata = {
  title: "Edit Education",
};

interface EditEducationPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditEducation({ params }: EditEducationPageProps) {
  const { id } = await params;
  return <AdminExperienceFormPage id={id} screen="education" />;
}
