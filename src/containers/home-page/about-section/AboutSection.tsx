import { Fragment } from "react";
import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";

/** "About Me." card. `bio` comes from the admin profile (paragraphs). */
export default function AboutSection({ bio }: { bio: string[] }) {
  return (
    <section className={styles.about}>
      <div className={styles.title}>
        <span className={styles.icon}>
          <HomeIcons.InfoSquare width={20} height={20} />
        </span>
        <h3>About Me.</h3>
        </div>
        {bio.length > 0 && (
          <p>
            {bio.map((paragraph, index) => (
              <Fragment key={index}>
                {index > 0 && <><br /><br /></>}
                {paragraph}
              </Fragment>
            ))}
          </p>
        )}
    </section>
  );
}
