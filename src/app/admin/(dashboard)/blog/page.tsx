import type { Metadata } from "next";
import AdminBlogPage from "@/containers/admin-blog-page";

export const metadata: Metadata = {
  title: "Blog",
};

export default function AdminBlog() {
  return <AdminBlogPage />;
}
