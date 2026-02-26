// ----------------------
// Convert FormData to JSON (excluding files)
// ----------------------
/**
 * Converts a FormData object into a plain JSON object.
 * Ignores any File objects in the FormData.
 *
 * @param formData - The FormData instance to convert
 * @returns A Record<string, string> containing all non-file fields
 */
export function formDataToJson(formData: FormData): Record<string, string> {
    return Array.from(formData.entries()).reduce((detail, [key, value]) => {
        // Only include fields that are NOT files
        if (!(value instanceof File)) {
            detail[key] = value.toString();
        }
        return detail;
    }, {} as Record<string, string>);
}

// ----------------------
// Generate random digits as a string
// ----------------------
/**
 * Generates a string of random digits (0-9)
 *
 * @param length - Number of digits to generate (default 10)
 * @returns A string containing random digits
 */
export function generateRandomDigits(length: number = 10): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 10) // Random number between 0 and 9
  ).join(''); // Join all digits into a single string
}

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