'use client'

import { createContext, ReactNode, useContext } from "react";

import { EMPTY_PROFILE } from "@/config/profileDefaults";
import { PublicProfile } from "@/utils/types";

const SiteProfileContext = createContext<PublicProfile>(EMPTY_PROFILE);

/**
 * Makes the owner profile (managed in /admin/profile) available to
 * site-wide client components such as the header and footer.
 * Loaded once on the server in the root layout.
 */
export function SiteProfileProvider({ profile, children }: { profile: PublicProfile; children: ReactNode }) {
  return <SiteProfileContext.Provider value={profile}>{children}</SiteProfileContext.Provider>;
}

/** The public profile: name, contact details, booking and social links. */
export const useSiteProfile = (): PublicProfile => useContext(SiteProfileContext);
