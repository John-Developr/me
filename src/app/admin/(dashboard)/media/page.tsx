import type { Metadata } from "next";
import AdminMediaPage from "@/containers/admin-media-page";

export const metadata: Metadata = {
  title: "Media Library",
};

export default function AdminMedia() {
  return <AdminMediaPage />;
}
