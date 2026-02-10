'use client'

import styles from "@/styles/admin/login.module.css"

import User from "@/components/icons/User";
import SquarePassword from "@/components/icons/SquarePassword";
import { login } from "@/action/auth/login";

export default function LoginForm() {
    const { request } = login();

    return (
        <form onSubmit={request}>
            <div className={styles["form-group"]}>
                <span className={styles["icon"]}>
                    <User 
                    width={18} 
                    height={18} />  
                </span>
                <input 
                    type="text" 
                    name="username" 
                    placeholder="Your username or e-mail" 
                    className={styles["form-control"]}
                    id="" />
            </div>
            <div className={styles["form-group"]}>
                <span className={styles["icon"]}>
                    <SquarePassword
                    width={18} 
                    height={18} />  
                </span>
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Your password" 
                    className={styles["form-control"]}
                    id="" />
            </div>
            <section className={styles["action"]}>
                <button>
                    Sign in
                </button>
                <hr />
                <button>
                    Continue as guest
                </button>
            </section>
        </form>
    );
}
