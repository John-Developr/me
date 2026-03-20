import React, { useRef } from "react";

import Image from "next/image";
import Link from "next/link";
import { sileo } from "sileo";

import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";
import { networkDefine } from "@/config/networkDefine";
import CopyClipboard from "@/components/clipoard";

export default function ConnectionSection() {
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
                const res = await fetch(networkDefine.RESUME_URL, {
                    method: "GET",
                    headers: {
                    "Content-Type": "application/pdf",
                    },
                });

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
            <section className={styles.email}>
                <p className={styles.title}>Email</p>
                <h5>
                    johncarlo.fullstackdev@
                    <span 
                        className={styles.icon} >
                        <CopyClipboard />               
                    </span>
                </h5>
            </section>
            <section className={styles.sched}>
                <p className={styles.title}>Let&#39;s Talk</p>
                <h5 className={styles.pointer}>
                    <a 
                        href={networkDefine.CALENDLY_URL} 
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
            <section className={styles.phone}>
                <p className={styles.title}>phone</p>
                <h5>
                    <Image
                        src="/images/Ph-Flag.png"
                        width={12}
                        height={12}
                        alt="Avatar"
                        className={styles.avatar} />
                    PH, (+632) 9293-1982
                    <span className={styles.icon}>
                        <HomeIcons.Call 
                         width={18} 
                         height={18} />
                    </span>
                </h5>
            </section>
            <section className={styles.resume}>
                <a 
                    href={"#"}
                    className={styles.pointer} 
                    onClick={downloadResume}>
                    Download Resume
                    <span className={styles.icon}>
                        <HomeIcons.Download 
                         width={18} 
                         height={18} />              
                    </span>
                </a>
            </section>
        </section>  
    )
}