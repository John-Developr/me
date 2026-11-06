import type { Metadata } from "next";
import AdminExperienceFormPage from "@/containers/admin-experience-form-page";

export const metadata: Metadata = {
  title: "Add Experience",
};

export default function AdminNewExperience() {
  return <AdminExperienceFormPage />;
}
