'use client';

import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";
import { useApp } from "@/lib/.context/AppContext";

export default function AboutSection() {
  return (
    <section className={styles.about}>
      <div className={styles.title}>
        <span className={styles.icon}>
          <HomeIcons.InfoSquare width={20} height={20} />
        </span>
        <h3>About Me.</h3>
        </div>
        <p>
          Hello there, I'm John Carlo, a 25-year-old web and mobile developer based in 
          Cebu, Philippines. I specialize in building scalable web, software, and mobile 
          applications that work seamlessly across platforms. With a strong foundation in 
          JavaScript, PHP, and other modern technologies, I'm passionate about 
          crafting solutions that are both efficient and impactful. 

          <br/>
          <br/>

          When I'm not writing code, you'll find me watching movies, reading, playing 
          video games, exploring new places, going for rides, traveling, or staying active 
          through sports.
        </p>
    </section>
  );
}
