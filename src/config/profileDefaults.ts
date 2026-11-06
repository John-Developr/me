import { PublicProfile } from "@/utils/types";

/**
 * An empty profile: used when no profile exists yet, or when site-wide
 * parts (header/footer) can't load it. Content lives in the database —
 * edit it in /admin/profile. Empty fields are hidden on the site.
 */
export const EMPTY_PROFILE: PublicProfile = {
  name:       "",
  headline:   null,
  location:   null,
  avatarUrl:  null,
  bio:        [],
  email:      null,
  phone:      null,
  resumeUrl:  null,
  bookingUrl: null,
  socials: {
    linkedin:  null,
    github:    null,
    facebook:  null,
    instagram: null,
    x:         null,
    website:   null,
  },
};
