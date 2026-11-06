import type { Metadata } from "next";
import AdminSkillsPage from "@/containers/admin-skills-page";

export const metadata: Metadata = {
  title: "Skills & Technologies",
};

export default function AdminSkills() {
  return <AdminSkillsPage />;
}
