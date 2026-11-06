import type { Metadata } from "next";
import AdminProfilePage from "@/containers/admin-profile-page";

export const metadata: Metadata = {
  title: "Personal Profile",
};

export default function AdminProfile() {
  return <AdminProfilePage />;
}
