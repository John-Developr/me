import { z } from "zod";

import { optionalAssetRef, optionalText, optionalUrl } from "./fieldSchemas";

/* ============================================================
   PROFILE VALIDATION
   ------------------------------------------------------------
   Shared by the Personal Profile form and the API. Limits match
   the CHECK constraints on public.profiles.
   ============================================================ */

/** Phone: digits, spaces and + ( ) - . only. */
const PHONE_PATTERN = /^[+()\d\s.-]{5,40}$/;

/** URL whose host is (a subdomain of) one of `hosts`. */
const urlOnHost = (label: string, hosts: string[]) =>
  optionalUrl(label).refine((v) => {
    if (v === null) return true;
    try {
      const host = new URL(v).hostname.toLowerCase();
      return hosts.some((h) => host === h || host.endsWith(`.${h}`));
    } catch {
      return false;
    }
  }, `${label} must be a ${hosts[0]} link.`);

export const profileInputSchema = z.object({
  full_name:    z.string().trim().min(1, "Full name is required.").max(120, "Full name must be 120 characters or fewer."),
  headline:     optionalText(160, "Headline"),
  location:     optionalText(120, "Location"),
  bio:          optionalText(5000, "Bio"),
  avatar_url:   optionalAssetRef("Photo"),
  email:        optionalText(254, "Email").refine(
                  (v) => v === null || z.email().safeParse(v).success,
                  "Enter a valid email address.",
                ),
  phone:        optionalText(40, "Phone").refine(
                  (v) => v === null || PHONE_PATTERN.test(v),
                  "Use digits, spaces and + ( ) - only.",
                ),
  resume_url:   optionalAssetRef("Resume"),
  website_url:  optionalUrl("Website"),
  github_url:   urlOnHost("GitHub", ["github.com"]),
  linkedin_url: urlOnHost("LinkedIn", ["linkedin.com"]),
  booking_url:  optionalUrl("Booking link"),
  facebook_url: urlOnHost("Facebook", ["facebook.com", "fb.com"]),
  instagram_url: urlOnHost("Instagram", ["instagram.com"]),
  x_url:        urlOnHost("X", ["x.com", "twitter.com"]),
});

export type ProfileInput = z.output<typeof profileInputSchema>;

/** Splits a bio into paragraphs on blank lines (how the home page renders it). */
export const toParagraphs = (bio: string | null | undefined): string[] =>
  (bio ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
