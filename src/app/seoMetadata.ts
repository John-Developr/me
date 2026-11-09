import type { Metadata } from "next";

import { BASE_URL } from "@/config/siteUrl";
import { SEO_PAGES, SeoPageKey } from "@/utils/admin/seoPages";
import { getSeoSettingsSafe } from "./getSiteSettings";

/**
 * Metadata for a public page from Admin → SEO Settings: the full title (as
 * shown in search results), description, keywords, canonical URL, and the
 * Open Graph / X cards. Share images come from each route's opengraph-image.
 *
 * If settings can't be loaded, returns only the canonical URL so the page
 * still renders (the root layout supplies a basic title). Pages whose
 * content needs the database fail on their own, and ISR then keeps the
 * last good version, metadata included.
 */
export async function buildPageMetadata(key: SeoPageKey): Promise<Metadata> {
  const { settings, pages } = await getSeoSettingsSafe();
  const page     = pages.find((p) => p.key === key);
  const path     = SEO_PAGES.find((p) => p.key === key)!.path;
  const url      = path === "/" ? BASE_URL : `${BASE_URL}${path}`;
  const siteName = settings.site_name ?? undefined;

  // No row for this page yet: just the site name (the layout's defaults cover the rest).
  if (!page) return { alternates: { canonical: url } };

  return {
    title:       { absolute: page.title },
    description: page.description,
    keywords:    page.keywords.length ? page.keywords : undefined,
    alternates:  { canonical: url },
    ...(key === "home" && siteName ? { authors: [{ name: siteName, url: BASE_URL }], creator: siteName, publisher: siteName } : {}),
    openGraph: {
      title:       page.title,
      description: page.description,
      url,
      siteName,
      type:        "website",
      locale:      "en_US",
    },
    twitter: {
      card:        "summary_large_image",
      title:       page.title,
      description: page.description,
      creator:     settings.twitter_handle ?? undefined,
    },
  };
}
