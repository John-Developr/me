import { renderOgImage, ogImageSize } from "@/utils/general/ogImage";

export const alt         = "Contact John Carlo A. Ylanan — Web & Mobile Developer";
export const size        = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow:  "Contact",
    title:    "Let's work together",
    subtitle: "Open for freelance projects, collaborations, and full-time opportunities.",
  });
}
