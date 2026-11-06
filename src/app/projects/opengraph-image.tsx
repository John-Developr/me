import { renderOgImage, ogImageSize } from "@/utils/general/ogImage";

export const alt         = "Projects by John Carlo A. Ylanan — Web & Mobile Developer";
export const size        = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow:  "Projects",
    title:    "My Work",
    subtitle: "Web and mobile projects — from author websites to large-scale teaching platforms.",
  });
}
