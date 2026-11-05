import { renderOgImage, ogImageSize } from "@/utils/general/ogImage";

export const alt         = "John Carlo A. Ylanan — Web & Mobile Developer Portfolio";
export const size        = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow:  "Portfolio",
    title:    "John Carlo A. Ylanan",
    subtitle: "Web & Mobile Developer based in Cebu, Philippines. React, Next.js, Swift, and Node.js.",
  });
}
