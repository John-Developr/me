import { renderOgImage, ogImageSize } from "@/utils/general/ogImage";
import { BASE_URL } from "@/config/siteUrl";
import { EMPTY_PROFILE } from "@/config/profileDefaults";
import { getPublicProfile } from "../../getPublicProfile";
import { getBlog } from "./getBlog";

export const alt         = "Blog post — link preview";
export const size        = ogImageSize;
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const [blog, profile] = await Promise.all([getBlog(slug), getPublicProfile().catch(() => EMPTY_PROFILE)]);
  const author = profile.name || "the author";

  return renderOgImage({
    eyebrow:  blog?.category ? `Blog · ${blog.category}` : "Blog",
    title:    blog?.title ?? "Blog Posts",
    subtitle: blog ? `${blog.reading} min read · ${author}` : `Articles by ${author}`,
    photo:    profile.avatarUrl,
    host:     BASE_URL.replace(/^https?:\/\//, ""),
  });
}
