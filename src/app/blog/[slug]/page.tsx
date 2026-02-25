import React from "react";
import BlogDetailPage from "@/containers/blog-detail-page";

export default function BlogDetail({ params }: { params: { slug: string } }) {
  return (
    <BlogDetailPage slug={params.slug} />
  )
}