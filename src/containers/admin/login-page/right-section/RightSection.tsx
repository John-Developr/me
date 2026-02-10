import styles from "@/styles/admin/login.module.css"
import LoginForm from "./LoginForm";

export default function RightSection() {
    return (
        <div className={styles["right-side"]}>
            <div className={styles["container"]}>
                <h2>Lorem Ipsum</h2>
                <p>Enter your Credentials to access your account.</p>
                <LoginForm />
            </div>
        </div>
    );
}
