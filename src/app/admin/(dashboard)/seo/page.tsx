import type { Metadata } from "next";
import AdminSeoPage from "@/containers/admin-seo-page";

export const metadata: Metadata = {
  title: "SEO Settings",
};

export default function AdminSeo() {
  return <AdminSeoPage />;
}
