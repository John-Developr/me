import Image from "next/image";
import styles from "@/styles/pages/page.module.css";
import SkeletonImage from "@/components/custom/SkeletonImage";

import { HomeIcons } from "@/components/icons";


export default function DetailSection(){
    return (
        <>
          <div className={styles.detail}>
              <p className={styles.name}>
                John Carlo A. Ylanan
              </p>
              <h2 className={styles.role}>
                Web and Mobile Developer
              </h2>
              <p className={styles.location}>
                  <HomeIcons.Location 
                    width={18} 
                    height={18} />
                    Cebu City, Cebu, Philippines, 6000
                  <Image
                    src="/images/Ph-Flag.png"
                    width={12}
                    height={12}
                    alt="Avatar"
                    className={styles.avatar} />
              </p>
              <div className={styles.action}>
                  <button>
                      <HomeIcons.Calendar 
                        width={18} 
                        height={18} />
                      Schedule a Call
                      <HomeIcons.ArrowRight 
                        width={18} 
                        height={18} />                                                                              
                  </button>
                  <button>
                      <HomeIcons.Message 
                        width={18} 
                        height={18} />
                      Send Email
                  </button>
              </div>
          </div>
          <div className={styles.profile}>
            <SkeletonImage 
              path="/images/Avatar.png" 
              className={styles.avatar} 
              width={75} 
              height={75} 
              alt="Avatar" />
              <span className={styles["online-indicator"]}></span>
          </div>
        </>
    )
}