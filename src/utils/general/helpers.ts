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
