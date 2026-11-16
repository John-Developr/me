import type { Metadata } from "next";
import AdminExperienceFormPage from "@/containers/admin-experience-form-page";

export const metadata: Metadata = {
  title: "Add Education",
};

export default function AdminNewEducation() {
  return <AdminExperienceFormPage screen="education" />;
}
