/* ============================================================
   ANALYTICS RULES (first-party page views)
   ------------------------------------------------------------
   What counts as a page view and what is stored. Shared by the
   tracker endpoint and its tests. Nothing here keeps personal data.
   ============================================================ */

/** Crawlers, previewers, monitors and headless browsers. */
const BOT_PATTERN =
  /bot\b|bot\/|crawl|spider|slurp|archiver|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot|discordbot|slackbot|vercel|lighthouse|pagespeed|headless|phantomjs|puppeteer|playwright|selenium|curl\/|wget\/|python-requests|axios\/|node-fetch|go-http-client|uptime|monitor|pingdom|statuscake/i;

export const isLikelyBot = (userAgent: string | null | undefined): boolean =>
  !userAgent || userAgent.length < 10 || BOT_PATTERN.test(userAgent);

/** Do Not Track or Global Privacy Control: don't record. */
export const hasOptedOut = (headers: { dnt?: string | null; gpc?: string | null }): boolean =>
  headers.dnt === "1" || headers.gpc === "1";

/**
 * Cleans a path for storage: no query string or hash, no admin/API paths,
 * at most 200 characters. Returns null when it shouldn't be recorded.
 */
export function normalizePath(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return null;

  let path = raw.split(/[?#]/)[0];
  if (path.length > 1) path = path.replace(/\/+$/, "");

  if (/^\/(admin|api|_next)(\/|$)/.test(path)) return null;
  if (path.length > 200 || /[\s<>"]/.test(path)) return null;

  return path || "/";
}

/** "https://www.Google.com/search?q=x" → "google.com"; null for own site, invalid, or none. */
export function referrerHost(referrer: unknown, ownHost: string | null): string | null {
  if (typeof referrer !== "string" || !referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    const own  = ownHost?.toLowerCase().replace(/^www\./, "").split(":")[0];
    return host && host !== own ? host.slice(0, 255) : null;
  } catch {
    return null;
  }
}

// ─── Visit details (coarse, non-identifying) ─────────────────

export type DeviceType = "desktop" | "mobile" | "tablet";

export interface VisitDevice {
  device:  DeviceType;
  browser: string;   // family name only, e.g. "Chrome" (no version)
  os:      string;   // family name only, e.g. "iOS"
}

/** Browser/OS family and device type from a user agent. Order matters (Edge and Opera also say "Chrome"). */
export function parseUserAgent(ua: string | null | undefined): VisitDevice {
  const s = ua ?? "";

  const device: DeviceType =
    /iPad|Tablet|PlayBook|Silk|Kindle|Android(?!.*Mobile)/i.test(s) ? "tablet" :
    /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(s)        ? "mobile" :
    "desktop";

  const browser =
    /Edg(e|A|iOS)?\//.test(s)          ? "Edge" :
    /OPR\/|Opera|OPiOS/.test(s)        ? "Opera" :
    /SamsungBrowser/.test(s)           ? "Samsung Internet" :
    /Firefox|FxiOS/.test(s)            ? "Firefox" :
    /CriOS|Chrome\//.test(s)           ? "Chrome" :
    /Version\/.*Safari|Safari/.test(s) ? "Safari" :
    "Other";

  const os =
    /Windows NT|Windows Phone/.test(s) ? "Windows" :
    /iPhone|iPod/.test(s)              ? "iOS" :
    /iPad/.test(s)                     ? "iPadOS" :
    /Android/.test(s)                  ? "Android" :
    /CrOS/.test(s)                     ? "ChromeOS" :
    /Mac OS X|Macintosh/.test(s)       ? "macOS" :
    /Linux/.test(s)                    ? "Linux" :
    "Other";

  return { device, browser, os };
}

export interface VisitLocation {
  country: string | null;   // ISO 3166-1 alpha-2, e.g. "PH"
  region:  string | null;   // region code, e.g. "07"
  city:    string | null;
}

/** Location from Vercel's request headers (no IP lookup; empty outside Vercel). */
export function readVercelGeo(get: (name: string) => string | null): VisitLocation {
  const decode = (v: string | null) => {
    if (!v) return null;
    try { return decodeURIComponent(v).trim().slice(0, 120) || null; } catch { return null; }
  };
  const country = get("x-vercel-ip-country")?.toUpperCase() ?? null;

  return {
    country: country && /^[A-Z]{2}$/.test(country) ? country : null,
    region:  decode(get("x-vercel-ip-country-region"))?.slice(0, 80) ?? null,
    city:    decode(get("x-vercel-ip-city")),
  };
}

/** "PH" → "🇵🇭" (regional indicator letters). */
export const flagEmoji = (code: string | null | undefined): string =>
  code && /^[A-Z]{2}$/i.test(code)
    ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : "🌐";
