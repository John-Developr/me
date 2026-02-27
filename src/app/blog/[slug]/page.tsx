import React from "react";
import BlogDetailPage from "@/containers/blog-detail-page";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogDetail({ params }: Props) {
  const { slug } = await params;

  return (
    <BlogDetailPage slug={slug} />
  );
}