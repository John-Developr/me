import Image from "next/image";
import styles from "@/styles/admin/login.module.css"
import { ArrowRightV2 } from "@/components/icons/ArrowRight";

export default function LeftSection() {
    return (
        <div className={styles["left-side"]}>
            <div className={styles["container"]}>
                <a href="/" className={styles["back"]}>
                    <span className={styles["icon"]}>
                        <ArrowRightV2
                        height={15}
                        width={15} />
                    </span>
                    Go to Public Site
                </a>
                <div className={styles["logo"]}>
                    <Image
                    src="/Logo.png"
                    width={75}
                    height={17}
                    alt="Avatar"/>
                </div>
                <div className={styles["intro"]}>
                    <section>
                        <h1>Hello<br/>There!</h1>
                        <Image
                        src="/images/RobotWave.png"
                        width={250}
                        height={250}
                        alt="Avatar"/>
                    </section>
                    <p>
                        Access powerful tools to manage content, users, and system settings. 
                        You can sign in for full administrative control, or continue as a guest to explore 
                        the dashboard freely and try out its features without restrictions.
                    </p>
                    <p>
                        Choose how you want to proceed and get started.
                    </p>
                </div>
                <footer>
                    © 2025 Lorem Ipsum. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
