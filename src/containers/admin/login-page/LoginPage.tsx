import styles from "@/styles/admin/login.module.css"

import LeftSection from "./left-section/LeftSection";
import RightSection from "./right-section/RightSection";

export default function LoginPage() {

    return (
        <div className={styles.login}>
            <LeftSection />
            <RightSection />
        </div>
    );
}
