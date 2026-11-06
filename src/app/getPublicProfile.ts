import { cache } from "react";

import ProfileService from "@/lib/.services/profileService";
import { EMPTY_PROFILE } from "@/config/profileDefaults";
import { toParagraphs } from "@/utils/admin/profileSchema";
import { PublicProfile } from "@/utils/types";

/**
 * The owner profile for the public site, managed in /admin/profile.
 * Empty fields are hidden on the site; with no profile row, everything is empty.
 *
 * Throws on database errors: pages are ISR, so a failed refresh keeps serving
 * the last good page instead of showing outdated copies from code.
 */
export const getPublicProfile = cache(async (): Promise<PublicProfile> => {
  const row = await ProfileService.getPublic();
  if (!row) return EMPTY_PROFILE;

  return {
    name:       row.full_name?.trim() ?? "",
    headline:   row.headline,
    location:   row.location,
    avatarUrl:  row.avatar_url,
    bio:        toParagraphs(row.bio),
    email:      row.email,
    phone:      row.phone,
    resumeUrl:  row.resume_url,
    bookingUrl: row.booking_url,
    socials: {
      linkedin:  row.linkedin_url,
      github:    row.github_url,
      facebook:  row.facebook_url,
      instagram: row.instagram_url,
      x:         row.x_url,
      website:   row.website_url,
    },
  };
});
