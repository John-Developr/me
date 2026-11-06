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
