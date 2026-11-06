import React, { useRef } from "react";

import Image from "next/image";
import Link from "next/link";
import { sileo } from "sileo";

import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";
import CopyClipboard from "@/components/clipboard";
import { PublicProfile } from "@/utils/types";

/** "Connect." card — email, phone and resume come from the admin profile. */
export default function ConnectionSection({ profile }: { profile: PublicProfile }) {
    const isDownloading = useRef(false);

    const downloadResume = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        if (isDownloading.current) return;
        isDownloading.current = true;

        const fakeDownload = new Promise((resolve) => {
            setTimeout(() => resolve(true), 1500);
        });

        sileo.promise(
            fakeDownload.then(async () => {
                // Plain GET (no custom headers) so a Media Library resume on
                // Supabase Storage downloads without a CORS preflight.
                if (!profile.resumeUrl) throw new Error("No resume set");
                const res = await fetch(profile.resumeUrl);

                if (!res.ok) throw new Error("Download failed");

                const blob = await res.blob();
                const pdfBlob = new Blob([blob], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(pdfBlob);

                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "JohnCarlo_Ylanan_Resume.pdf");
                document.body.appendChild(link);

                setTimeout(() => {
                    link.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    }));
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }, 100);
            }),
            {
                loading: { title: "Downloading resume..." },
                success: { title: "Successfully Downloaded John Carlo's Resume" },
                error: { title: "Failed to download John Carlo's Resume" },
            }
        ).finally(() => {
            isDownloading.current = false;
        });
    };

    return (
        <section className={styles.connect}>
            <div className={styles.title}>
                <HomeIcons.Message 
                 width={20} 
                 height={20} />
                <h3>Connect.</h3>
            </div>
            {profile.email && (
            <section className={styles.email}>
                <p className={styles.title}>Email</p>
                <h5>
                    {/* Only the part before the domain is shown; the copy button copies all of it. */}
                    {profile.email.split("@")[0]}@
                    <span 
                        className={styles.icon} >
                        <CopyClipboard text={profile.email} />               
                    </span>
                </h5>
            </section>
            )}
{profile.bookingUrl && (
                        <section className={styles.sched}>
                <p className={styles.title}>Let&#39;s Talk</p>
                <h5 className={styles.pointer}>
                    <a 
                        href={profile.bookingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer">
                        Schedule a Call in Calendar
                        <span className={styles.icon}>
                            <HomeIcons.ArrowRight 
                             width={18} 
                             height={18} />
                        </span>
                    </a>
                </h5>
            </section>
            )}
            <section className={styles.myform}>
                <p className={styles.title}>contact</p>
                <h5 className={styles.pointer}>
                    <Link href="/contact">
                        Message me using my form
                        <span className={styles.icon}>
                            <HomeIcons.Document 
                            width={18} 
                            height={18} />
                        </span>
                    </Link>
                </h5>
            </section>
            {profile.phone && (
            <section className={styles.phone}>
                <p className={styles.title}>phone</p>
                <h5>
                    <Image
                        src="/images/Ph-Flag.png"
                        width={12}
                        height={12}
                        alt="Avatar"
                        className={styles.avatar} />
                    PH, {profile.phone}
                    <span className={styles.icon}>
                        <HomeIcons.Call 
                         width={18} 
                         height={18} />
                    </span>
                </h5>
            </section>
            )}
            {profile.resumeUrl && (
            <section className={styles.resume}>
                <a 
                    href={"#"}
                    className={`${styles.pointer} liquid_glass_btn`}
                    onClick={downloadResume}>
                    Download Resume
                    <span className={styles.icon}>
                        <HomeIcons.Download 
                         width={18} 
                         height={18} />              
                    </span>
                </a>
            </section>
            )}
        </section>  
    )
}