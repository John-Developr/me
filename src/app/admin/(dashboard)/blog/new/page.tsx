import type { Metadata } from "next";
import AdminBlogFormPage from "@/containers/admin-blog-form-page";

export const metadata: Metadata = {
  title: "New Post",
};

export default function AdminNewBlogPost() {
  return <AdminBlogFormPage />;
}
