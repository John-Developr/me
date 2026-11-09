/**
 * Formats a date string into a readable format (e.g., "February 24, 2026").
 *
 * @param dateString - The date string to format (ISO string or valid date format).
 * @returns A formatted date string in "Month Day, Year" format.
 *          Returns an empty string if the input is undefined or invalid.
 */
export function formatDate(dateString?: string): string {
  // Return empty string if no date is provided
  if (!dateString) return "";

  // Convert the string into a Date object
  const date = new Date(dateString);

  // Check if the date is invalid
  if (isNaN(date.getTime())) return "";

  // Format and return the date in "Month Day, Year" format
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}


/**
 * Sanitizes a string to prevent HTML injection attacks.
 * Escapes special HTML characters before injecting into the email template.
 *
 * @param str - The string to sanitize (defaults to empty string)
 * @returns   - Sanitized string safe for HTML injection
 *
 * @example
 * sanitize('<script>alert("xss")</script>')
 * // → "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
 */
export const sanitize = (str: string = ""): string => str
  .replace(/&/g,  "&amp;")
  .replace(/</g,  "&lt;")
  .replace(/>/g,  "&gt;")
  .replace(/"/g,  "&quot;")
  .replace(/'/g,  "&#039;");

/**
 * Validates an email address format using a simple regex pattern.
 *
 * @param email - The email address to validate
 * @returns     - True if the email format is valid, false otherwise
 *
 * @example
 * isValidEmail("john@example.com") // → true
 * isValidEmail("not-an-email")     // → false
 */
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
/**
 * Turns any string into a URL slug: lowercase a–z/0–9 words joined by
 * hyphens, trimmed to at most `maxLength` characters on a word boundary.
 *
 * @param input     - Raw text (e.g. a model-suggested slug or a title)
 * @param maxLength - Maximum slug length (default 40)
 * @returns         - The slug, or "" if nothing usable remains
 *
 * @example
 * slugify("Why I Stopped Using ORMs!") // → "why-i-stopped-using-orms"
 */
export const slugify = (input: string = "", maxLength: number = 40): string => {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length <= maxLength) return slug;

  const cut = slug.slice(0, maxLength);
  return cut.includes("-") ? cut.slice(0, cut.lastIndexOf("-")) : cut;
};

/**
 * Estimates reading time at ~200 words per minute (minimum 1 minute).
 *
 * @param text - Post content (markdown is fine)
 * @returns    - Whole minutes
 *
 * @example
 * getReadingTime("word ".repeat(450)) // → 3
 */
export const getReadingTime = (text: string = ""): number =>
  Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 200));
