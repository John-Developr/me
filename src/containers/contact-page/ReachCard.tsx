import styles from "@/styles/pages/contact.module.css";

import CopyClipboard from "@/components/clipboard";
import Message from "@/components/icons/Message";
import Calendar from "@/components/icons/Calendar";
import Call from "@/components/icons/Call";
import Location from "@/components/icons/Location";
import MessageSquare from "@/components/icons/MessageSquare";
import { PublicProfile } from "@/utils/types";

/**
 * "Other ways to reach me." card beside the contact form. Every row comes
 * from the profile (Admin → Personal Profile) and is hidden when empty; the
 * whole card is hidden when there is nothing to show.
 */
export default function ReachCard({ profile }: { profile: PublicProfile }) {
    const { email, bookingUrl, phone, location } = profile;
    if (!email && !bookingUrl && !phone && !location) return null;

    return (
        <aside className={styles["reach-card"]} aria-labelledby="reach-title">
            <h2 id="reach-title" className={styles["reach-title"]}>
                <MessageSquare width={20} height={20} aria-hidden="true" />
                Other ways to reach me.
            </h2>

            <ul className={styles["reach-list"]}>
                {email && (
                    <li>
                        <span className={styles["reach-icon"]}><Message width={18} height={18} aria-hidden="true" /></span>
                        <span className={styles["reach-text"]}>
                            <small>Email</small>
                            {/* Like the home Connect card: only the part before the domain is shown;
                                the link and the copy button still use the full address. */}
                            <a href={`mailto:${email}`} aria-label={`Email ${email}`}>{email.split("@")[0]}@</a>
                        </span>
                        <span className={styles["reach-copy"]}><CopyClipboard text={email} /></span>
                    </li>
                )}
                {bookingUrl && (
                    <li>
                        <span className={styles["reach-icon"]}><Calendar width={18} height={18} aria-hidden="true" /></span>
                        <span className={styles["reach-text"]}>
                            <small>Prefer to talk?</small>
                            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" aria-label="Schedule a call (opens in a new tab)">
                                Schedule a call
                            </a>
                        </span>
                    </li>
                )}
                {phone && (
                    <li>
                        <span className={styles["reach-icon"]}><Call width={18} height={18} aria-hidden="true" /></span>
                        <span className={styles["reach-text"]}>
                            <small>Phone</small>
                            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a>
                        </span>
                    </li>
                )}
                {location && (
                    <li>
                        <span className={styles["reach-icon"]}><Location width={18} height={18} aria-hidden="true" /></span>
                        <span className={styles["reach-text"]}>
                            <small>Based in</small>
                            <span>{location}</span>
                        </span>
                    </li>
                )}
            </ul>
        </aside>
    );
}
