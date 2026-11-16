import type { Metadata } from "next";
import AdminExperiencePage from "@/containers/admin-experience-page";

export const metadata: Metadata = {
  title: "Education",
};

/** Education entries of the experience timeline (same table, API and form as Work Experience). */
export default function AdminEducation() {
  return <AdminExperiencePage screen="education" />;
}
