import { renderOgImage, ogImageSize } from "@/utils/general/ogImage";
import { getBlog } from "./getBlog";

export const alt         = "Blog post by John Carlo A. Ylanan";
export const size        = ogImageSize;
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const blog     = await getBlog(slug);

  return renderOgImage({
    eyebrow:  blog?.category ? `Blog · ${blog.category}` : "Blog",
    title:    blog?.title ?? "Blog Posts",
    subtitle: blog ? `${blog.reading} min read · John Carlo A. Ylanan` : "Articles by John Carlo A. Ylanan",
  });
}
