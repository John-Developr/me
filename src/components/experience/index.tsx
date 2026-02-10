import Image from "next/image";

import styles from "@/styles/pages/experience.module.css"
import { ExperiencesContainerProps, ExperienceContentProps } from "@/config/personalConfig";

export default function ExperiencesContainer({ experiences, callFrom}: ExperiencesContainerProps) {
  return (
    <ul className={styles["list-exp"]} data-from={callFrom}>
      {experiences.map((exp, index) => (
        <ExperienceContent
          key={index}
          contents={exp} />
      ))}
    </ul>
  );
}

function ExperienceContent({ contents }: ExperienceContentProps) {
  const {
    company,
    title,
    date,
    description,
    tools,
    image,
    withSub,
  } = contents;

  if (!withSub || withSub.length === 0) {
    return (
      <li className={styles["no-sub"]}>
        <div className={styles["ex-name-date-profile"]}>
          {image && <Image
            src={image}
            width={25}
            height={25}
            alt="Avatar"
            className={styles.avatar} />}
          <section className={image ? "" : styles["no-image"]}>
            <h4>{company}</h4>  
            {title && <p className={styles["ex-pos"]}>{title}</p>}
            {date && <p className={styles["ex-date"]}>{date}</p>}
          </section>
        </div>
        {(description || tools) && (
          <div className={styles["more-info"]}>
            {description && description.map((description, index) => (
                <p 
                  key={index} 
                  className={styles["ex-descrip"]}>
                  {description}
                </p>
            ))}
            {tools && (
              <>
                <div className={styles["tech-containers"]}>
                  <p>Technologies</p>
                  <div className={styles["tools-list"]}>
                    {tools.split(",").map((description, index) => (
                      <span 
                        key={index} 
                        className={styles["tool"]}>
                        {description.trim()}
                      </span>
                    ))}  
                  </div>
                </div>
              </>
            )}
          </div> 
        )}
      </li>
    );
  }

  return (
    <li className={styles["has-sub"]}>
      <div className={styles["ex-name-date-profile"]}>
        {image && <Image
            src={image}
            width={25}
            height={25}
            alt="Avatar"
            className={styles.avatar} />}
        <section className={image ? "" : styles["no-image"]}>
          <h4>{company}</h4>
          {date && <p className={styles["ex-date"]}>{date}</p>}
        </section>
      </div>
      <ul>
        {withSub.map(({title, date, description, tools}, index) => (
          <li key={index}>
            {title && <p className={styles["ex-pos"]}>{title}</p>}
            {date && <p className={styles["ex-date"]}>{date}</p>}
            {(description || tools) && (
              <div className={styles["more-info"]}>
                {description && description.map((description, index) => (
                    <p 
                      key={index} 
                      className={styles["ex-descrip"]}>
                      {description}
                    </p>
                ))}
                {tools && (
                  <div className={styles["tech-containers"]}>
                    <p>Technologies</p>
                    <div className={styles["tools-list"]}>
                      {tools.split(",").map((description, index) => (
                        <span 
                          key={index} 
                          className={styles["tool"]}>
                          {description.trim()}
                        </span>
                      ))}  
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
}