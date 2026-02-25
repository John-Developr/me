import React from "react";
import BlogDetailPage from "@/containers/blog-detail-page";

// 1. Define the type where params is a Promise
type Props = {
  params: Promise<{ slug: string }>;
};

// 2. Make the component async and await the params
export default async function BlogDetail({ params }: Props) {
  const { slug } = await params;

  return (
    <BlogDetailPage slug={slug} />
  );
}