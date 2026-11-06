import type { ProfileCompletion, ProfileRecord } from "@/utils/types";

/* ============================================================
   PROFILE COMPLETION RULES
   ------------------------------------------------------------
   Eight rules, equal weight (12.5% each). A text field counts
   only when it has non-whitespace content.

   1. Full name
   2. Headline
   3. Bio — at least 50 characters, so a placeholder doesn't count
   4. Profile photo (avatar_url)
   5. Contact email
   6. Location
   7. Resume (resume_url)
   8. At least one social link (GitHub or LinkedIn)

   No profile row → 0% with every rule missing.
   ============================================================ */

/** Minimum bio length that counts as filled in. */
export const MIN_BIO_LENGTH = 50;

interface CompletionRule {
  label: string;
  /** Form field to focus when the rule fails. */
  field: keyof ProfileRecord;
  test:  (profile: ProfileRecord) => boolean;
}

const filled = (value: string | null | undefined): boolean => !!value && value.trim().length > 0;

export const PROFILE_COMPLETION_RULES: readonly CompletionRule[] = [
  { label: "Full name",     field: "full_name",  test: (p) => filled(p.full_name) },
  { label: "Headline",      field: "headline",   test: (p) => filled(p.headline) },
  { label: `Bio (${MIN_BIO_LENGTH}+ characters)`, field: "bio", test: (p) => (p.bio?.trim().length ?? 0) >= MIN_BIO_LENGTH },
  { label: "Profile photo", field: "avatar_url", test: (p) => filled(p.avatar_url) },
  { label: "Contact email", field: "email",      test: (p) => filled(p.email) },
  { label: "Location",      field: "location",   test: (p) => filled(p.location) },
  { label: "Resume",        field: "resume_url", test: (p) => filled(p.resume_url) },
  { label: "Social link (GitHub or LinkedIn)", field: "github_url", test: (p) => filled(p.github_url) || filled(p.linkedin_url) },
];

/**
 * Scores a profile against PROFILE_COMPLETION_RULES.
 *
 * @param profile - The profile row, or null when none exists yet
 * @returns Percentage (rounded) plus which rules pass and fail
 */
export function getProfileCompletion(profile: ProfileRecord | null): ProfileCompletion {
  if (!profile) {
    return {
      percent:   0,
      completed: [],
      missing:   PROFILE_COMPLETION_RULES.map((rule) => rule.label),
      exists:    false,
    };
  }

  const completed: string[] = [];
  const missing:   string[] = [];

  for (const rule of PROFILE_COMPLETION_RULES) {
    (rule.test(profile) ? completed : missing).push(rule.label);
  }

  return {
    percent: Math.round((completed.length / PROFILE_COMPLETION_RULES.length) * 100),
    completed,
    missing,
    exists: true,
  };
}
