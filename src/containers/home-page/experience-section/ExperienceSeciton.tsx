import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";

import { me } from "@/config/personalConfig"
import ExperiencesContainer from "@/components/experience";


export default function ExperienceSection() {
    let callFrom = "Home";

    return (
        <section className={styles.experience}>
            <div className={styles.title}>
                <HomeIcons.Work 
                 width={20} 
                 height={20} />
                <h3>Experience.</h3>
            </div>
            <ExperiencesContainer 
             experiences={me.experience.filterSetAllDescriptionsToolsToNull()} 
             callFrom={callFrom} /> 
            <div className={styles["see-more"]}>
              <a href="/experience">
                <HomeIcons.ArrowTopRightCircle 
                 width={15} 
                 height={15} />
                See More
              </a>
            </div>
        </section>
    )
}