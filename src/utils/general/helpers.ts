// ----------------------
// Debounce utility
// ----------------------
/**
 * Creates a debounced version of a function.
 *
 * Debounce delays the execution of `func` until after
 * `wait` milliseconds have passed since the last time
 * the returned function was invoked.
 *
 * Useful for:
 * - Search inputs
 * - Resize/scroll events
 * - Preventing excessive API calls
 *
 * @param func - The function to debounce
 * @param wait - Delay in milliseconds (default: 300ms)
 * @returns A new debounced function
 */
export function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait = 300
) {
  // Holds the timeout ID between calls
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Args) => {
    // Clear any previously scheduled execution
    clearTimeout(timeout);

    // Schedule new execution after `wait` time
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
// ----------------------
// Cron request authorization (server-side)
// ----------------------
/**
 * Checks that a request comes from Vercel Cron (or someone holding the secret).
 * Fails closed: if CRON_SECRET is not configured, every request is rejected —
 * otherwise "Bearer undefined" would be accepted.
 *
 * @param req - Incoming route handler request
 * @returns true only when CRON_SECRET is set and the bearer token matches
 */
export function isCronAuthorized(req: Request): boolean {
    const secret = process.env.CRON_SECRET;

    if (!secret) {
        return false;
    }

    return req.headers.get("Authorization") === `Bearer ${secret}`;
}
