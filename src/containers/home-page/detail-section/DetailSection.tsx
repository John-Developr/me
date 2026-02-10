'use client'

import Image from "next/image";

import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";

import { me } from "@/config/personalConfig"
import { useApp } from "@/lib/context/AppContext";
import SkeletonImage from "@/components/custom/SkeletonImage";


export default function DetailSection(){
    const { user } = useApp();

    return (
        <>
          <div className={styles.detail}>
              <p className={styles.name}>
                {`${user?.fname} ${me.name.mid.charAt(0)}. ${user?.lname}`}
              </p>
              <h2 className={styles.role}>
                {me.role}
              </h2>
              <p className={styles.location}>
                  <HomeIcons.Location 
                    width={18} 
                    height={18} />
                  {`${user?.city}, ${user?.province}, ${user?.country}`}
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
              path={user?.profile} 
              className={styles.avatar} 
              width={75} 
              height={75} 
              alt="Avatar" />
              <span className={styles["online-indicator"]}></span>
          </div>
        </>
    )
}