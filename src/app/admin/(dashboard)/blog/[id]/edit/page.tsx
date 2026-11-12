import type { Metadata } from "next";
import AdminBlogFormPage from "@/containers/admin-blog-form-page";

export const metadata: Metadata = {
  title: "Edit Post",
};

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditBlogPost({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  return <AdminBlogFormPage id={id} />;
}
