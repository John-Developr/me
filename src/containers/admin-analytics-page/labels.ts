import { flagEmoji } from "@/utils/analytics";
import { BreakdownDimension } from "@/utils/types";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** "PH" → "Philippines" (falls back to the code). */
export function countryName(code: string | null | undefined): string {
  if (!code) return "Unknown";
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** Display text (with flag where it helps) for a breakdown row label. */
export function breakdownLabel(dimension: BreakdownDimension, label: string): string {
  if (!label) return dimension === "referrer" ? "Direct / unknown" : "Unknown";

  switch (dimension) {
    case "country":
      return `${flagEmoji(label)} ${countryName(label)}`;
    case "city": {
      // "Cebu City, PH" → "🇵🇭 Cebu City"
      const parts = label.split(", ");
      const code  = parts.length > 1 ? parts.at(-1)! : null;
      return code && /^[A-Z]{2}$/.test(code) ? `${flagEmoji(code)} ${parts.slice(0, -1).join(", ")}` : label;
    }
    case "device":
      return label.charAt(0).toUpperCase() + label.slice(1);
    default:
      return label;
  }
}

export const BREAKDOWN_TITLES: Record<BreakdownDimension, string> = {
  country:  "Countries",
  city:     "Cities",
  referrer: "Sources",
  device:   "Devices",
  browser:  "Browsers",
  os:       "Operating systems",
  path:     "Pages",
};

/** Column heading for each list ("Country", "City", …). */
export const BREAKDOWN_SINGULAR: Record<BreakdownDimension, string> = {
  country:  "Country",
  city:     "City",
  referrer: "Source",
  device:   "Device",
  browser:  "Browser",
  os:       "Operating system",
  path:     "Page",
};
