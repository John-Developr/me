import { BASE_URL } from "@/config/siteUrl";
import { EMPTY_PROFILE } from "@/config/profileDefaults";
import { SeoPageKey } from "@/utils/admin/seoPages";
import { renderCustomOgImage, renderOgImage } from "@/utils/general/ogImage";

import { getPublicProfile } from "./getPublicProfile";
import { getSeoSettingsSafe } from "./getSiteSettings";

/** "Projects | John Carlo Ylanan" → "Projects" (the card already shows who it is). */
const stripSiteName = (title: string, siteName: string | null) =>
  siteName ? title.replace(new RegExp(`\\s*[|—–-]\\s*${siteName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "") : title;

/** Keep the card's subtitle to about two lines. */
const clip = (text: string, max = 140) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/**
 * Share image for a public page, from Admin → SEO Settings:
 * the page's custom share image if set, otherwise a generated card with the
 * page's SEO title/description and the Personal Profile photo.
 */
export async function renderPageOgImage(key: SeoPageKey, eyebrow: string) {
  const [{ settings, pages }, profile] = await Promise.all([
    getSeoSettingsSafe(),
    getPublicProfile().catch(() => EMPTY_PROFILE),
  ]);
  const page = pages.find((p) => p.key === key);

  if (page?.share_image_url) {
    const custom = await renderCustomOgImage(page.share_image_url);
    if (custom) return custom;
  }

  const title = key === "home"
    ? profile.name || settings.site_name || "Portfolio"
    : stripSiteName(page?.title ?? eyebrow, settings.site_name);

  return renderOgImage({
    eyebrow,
    title,
    subtitle: clip(page?.description ?? profile.headline ?? ""),
    photo:    profile.avatarUrl,
    host:     BASE_URL.replace(/^https?:\/\//, ""),
  });
}
