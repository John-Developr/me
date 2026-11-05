import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogDetailPage from "@/containers/blog-detail-page";
import { getBlog } from "./getBlog";
import { BASE_URL } from "@/config/siteUrl";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog     = await getBlog(slug);

  if (!blog) {
    return { title: "Blog" };
  }

  const url         = `${BASE_URL}/blog/${slug}`;
  const description = blog.excerpt || blog.content?.slice(0, 160);

  return {
    title: blog.title,
    description,
    keywords: blog.tags,
    openGraph: {
      title: blog.title,
      description,
      url,
      siteName: "John Carlo Portfolio",
      type: "article",
      publishedTime: blog.generated_at,
      authors: ["John Carlo A. Ylanan"],
      tags: blog.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogDetail({ params }: Props) {
  const { slug } = await params;
  const blog     = await getBlog(slug);

  if (blog === null) {
    notFound();
  }

  return <BlogDetailPage slug={slug} initialBlog={blog} />;
}
