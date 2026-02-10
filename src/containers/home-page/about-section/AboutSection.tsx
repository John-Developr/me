'use client';

import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";
import { useApp } from "@/lib/context/AppContext";

export default function AboutSection() {
  const { user } = useApp();

  return (
    <section className={styles.about}>
      <div className={styles.title}>
        <span className={styles.icon}>
          <HomeIcons.InfoSquare width={20} height={20} />
        </span>
        <h3>About Me.</h3>
        </div>
        {/* <p style={{ whiteSpace: "pre-line" }}
            dangerouslySetInnerHTML={{
            //   __html: user.about.replace(/\(break\)/g, "<br/>"),
            __html: user.about.replace(/\(break\)/g, "<br/>"),
            }}
        /> */}
        <p style={{ whiteSpace: "pre-line" }}>{user?.about}</p>
    </section>
  );
}
