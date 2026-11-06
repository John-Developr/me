'use client'

import styles from "@/styles/pages/admin.module.css";

/** Last-resort boundary; sections normally handle their own errors. */
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className={styles.card} role="alert">
      <h2 className={styles["page-error-title"]}>Something went wrong loading the dashboard.</h2>
      <p className={styles["page-error-text"]}>Your data is safe. Try again, or reload the page.</p>
      <button type="button" className={`liquid_glass_btn ${styles["btn-primary"]}`} onClick={reset}>Try again</button>
    </div>
  );
}
