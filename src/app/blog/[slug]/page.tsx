// import type { Metadata } from "next";
import BlogDetailPage from "@/containers/blog-detail-page";
// import { networkDefine } from "@/config/networkDefine";

// async function getBlog(slug: string) {
//   const res = await fetch(networkDefine.BLOG_DETAIL_API(slug), {
//     next: { revalidate: 60 },
//   });

//   if (!res.ok) return null;
//   return res.json();
// }

// export async function generateMetadata(
//   { params }: { params: { slug: string } }
// ): Promise<Metadata> {
//   const blog = await getBlog(params.slug);

//   if (!blog) {
//     return {
//       title: "Blog Not Found | John Carlo Ylanan",
//     };
//   }

//   return {
//     title: `${blog.title} | John Carlo Ylanan`,
//     description: blog.excerpt || blog.content.slice(0, 150),
//     keywords: [
//       blog.title,
//       "John Carlo Blog",
//       "Web Development",
//       "iOS Development",
//       "Programming",
//     ],
//     openGraph: {
//       title: blog.title,
//       description: blog.excerpt,
//       url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${params.slug}`,
//       siteName: "John Carlo Portfolio",
//       images: [
//         {
//           url: `${process.env.NEXT_PUBLIC_BASE_URL}/default-og.png`,
//           width: 1200,
//           height: 630,
//         },
//       ],
//       type: "article",
//     },
//     // twitter: {
//     //   card: "summary_large_image",
//     //   title: blog.title,
//     //   description: blog.excerpt,
//     //   images: [blog.coverImage || "/default-og.png"],
//     // },
//     alternates: {
//       canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${params.slug}`,
//     },
//   };
// }

export default async function BlogDetail({
  params,
}: {
  params: { slug: string };
}) {
  return <BlogDetailPage slug={params.slug} />;
}