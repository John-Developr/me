export function formatMessageBubbleString(input: string): string {
    if (!input) return '';

    // Replace <br> tags with newlines
    let result = input.replace(/<br\s*\/?>/gi, '\n');

    // // Regex to match URLs including plain domains like example.com
    // const urlRegex = /\b((https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?)/gi;

    // result = result.replace(urlRegex, (match) => {
    //     let href = match;
    //     if (!href.startsWith('http')) {
    //         href = `https://${href}`;
    //     }
    //     return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    // });

    // // Convert newlines to <br> for HTML rendering
    result = result.replace(/\n/g, '<br>');

    return result;
}

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