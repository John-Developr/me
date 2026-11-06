import type { Metadata } from "next";
import AdminExperiencePage from "@/containers/admin-experience-page";

export const metadata: Metadata = {
  title: "Work Experience",
};

export default function AdminExperience() {
  return <AdminExperiencePage />;
}
