import Image from "next/image";
import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";


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
                    <span className={styles.icon}>
                        <HomeIcons.CopyPaste 
                         width={18} 
                         height={18} />                                    
                    </span>
                </h5>
            </section>
            <section className={styles.sched}>
                <p className={styles.title}>Let's Talk</p>
                <h5 className={styles.pointer}>
                    Schedule a Call in Calendar
                    <span className={styles.icon}>
                        <HomeIcons.ArrowRight 
                         width={18} 
                         height={18} />
                    </span>
                </h5>
            </section>
            <section className={styles.inquire}>
                <p className={styles.title}>contact</p>
                <h5 className={styles.pointer}>
                    Message me using my form
                    <span className={styles.icon}>
                        <HomeIcons.Document 
                         width={18} 
                         height={18} />
                    </span>
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
                <a href="#">
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