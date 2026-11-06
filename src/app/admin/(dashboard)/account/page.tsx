import type { Metadata } from "next";
import AdminAccountPage from "@/containers/admin-account-page";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default function AdminAccount() {
  return <AdminAccountPage />;
}
