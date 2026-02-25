import React from "react";
import BlogDetailPage from "@/containers/blog-detail-page";

export default function BlogDetail({ params }: { params: { value: string } }) {
  return (
    <BlogDetailPage params={params} />
  )
}