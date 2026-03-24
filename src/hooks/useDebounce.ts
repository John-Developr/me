// hooks/useDebounce.ts
import { useEffect, useRef } from "react";

/**
 * useDebounce — delays the execution of a callback until after
 * a specified delay has passed since the last dependency change.
 *
 * Useful for debouncing API calls triggered by user input,
 * filter changes, or sort toggles without spamming the server.
 *
 * @param callback - Function to execute after the debounce delay
 * @param deps     - Dependency array — same as useEffect deps
 * @param delay    - Delay in milliseconds before callback fires (e.g. 500)
 *
 * @example
 * // Basic usage — debounce a search input
 * useDebounce(() => {
 *   searchUsers(query);
 * }, [query], 300);
 *
 * @example
 * // Debounce blog list fetch on filter/sort change
 * useDebounce(() => {
 *   setState("loading");
 *   fetchBlogList();
 * }, [category, sort], 500);
 *
 * @example
 * // Auto-save form data
 * useDebounce(() => {
 *   saveToStorage(formData);
 * }, [formData], 1000);
 */
export function useDebounce(
  callback: () => void,
  deps: React.DependencyList,
  delay: number
): void {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any existing timer before starting a new one
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Schedule callback after delay
    debounceRef.current = setTimeout(() => {
      callback();
    }, delay);

    // Cleanup — cancels pending timer on unmount or before next effect
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  // ↑ deps passed directly — exhaustive-deps disabled intentionally
  // because callback and delay are not included to avoid infinite loops
}