import { ogImageSize } from "@/utils/general/ogImage";
import { renderPageOgImage } from "../pageOgImage";

// Content comes from Admin → SEO Settings and the Personal Profile photo.
// Saving either revalidates it; this is only a safety net.
export const revalidate  = 300;
export const alt         = "Blog — link preview";
export const size        = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return renderPageOgImage("blog", "Blog");
}
