import type { Metadata } from "next";
import AdminExperienceFormPage from "@/containers/admin-experience-form-page";

export const metadata: Metadata = {
  title: "Edit Experience",
};

interface EditExperiencePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditExperience({ params }: EditExperiencePageProps) {
  const { id } = await params;
  return <AdminExperienceFormPage id={id} />;
}
