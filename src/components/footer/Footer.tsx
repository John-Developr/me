'use client'

import { useSiteProfile } from "@/lib/.context/SiteProfileContext";

import Copyright from "./Copyright";

// SVG
import { Facebook } from "../icons/Facebook";
import Instagram from "../icons/Instagram";
import Twitter from "../icons/Twitter";
import { Linkedin } from "../icons/Linkedin";
import Github from "../icons/Github";

/** Social icons in display order; only those with a link in the profile are shown. */
const SOCIALS = [
    { key: "facebook",  label: "Facebook",    Icon: Facebook  },
    { key: "instagram", label: "Instagram",   Icon: Instagram },
    { key: "x",         label: "X (Twitter)", Icon: Twitter   },
    { key: "linkedin",  label: "LinkedIn",    Icon: Linkedin  },
    { key: "github",    label: "GitHub",      Icon: Github    },
] as const;

export default function Footer() {
    const profile     = useSiteProfile();
    const socials     = SOCIALS.filter(({ key }) => profile.socials[key]);

    return (
    <>
        <hr className="hr-horizontal" />
        <footer className="section">
            <Copyright />
            {socials.length > 0 && (
                <section className="socials">
                    <ul>
                        {socials.map(({ key, label, Icon }) => (
                            <li key={key}>
                                <a
                                    href={profile.socials[key]!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${label} (opens in a new tab)`}>
                                    <Icon 
                                        width={17.5}
                                        height={17.5} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </footer>
    </>
   );
}
