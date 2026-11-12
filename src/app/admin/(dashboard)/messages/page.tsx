import type { Metadata } from "next";
import AdminMessagesPage from "@/containers/admin-messages-page";

export const metadata: Metadata = {
  title: "Contact Messages",
};

export default function AdminMessages() {
  return <AdminMessagesPage />;
}
