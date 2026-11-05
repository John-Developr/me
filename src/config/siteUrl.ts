/**
 * Canonical site origin, without a trailing slash.
 *
 * Read from NEXT_PUBLIC_BASE_URL; trailing slashes are stripped so
 * `${BASE_URL}/blog` never becomes `https://example.com//blog`.
 */
export const BASE_URL: string = (
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://johncarlo-portfolio.vercel.app"
).replace(/\/+$/, "");
