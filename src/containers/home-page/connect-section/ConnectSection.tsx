import React from "react";

import Image from "next/image";
import Link from "next/link";

import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";
import { networkDefine } from "@/config/networkDefine";
import CopyClipboard from "@/components/clipoard";

export default function ConnectionSection() {
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
                    href={networkDefine.RESUME_URL}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.pointer} download>
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