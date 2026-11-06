import Image from "next/image";
import styles from "@/styles/pages/page.module.css";
import SkeletonImage from "@/components/custom/SkeletonImage";

import { HomeIcons } from "@/components/icons";
import { PublicProfile } from "@/utils/types";

/** Hero: name, headline, location, actions and photo — from the admin profile. */
export default function DetailSection({ profile }: { profile: PublicProfile }){
    return (
        <>
          <div className={styles.detail}>
              {profile.name && (
                <p className={styles.name}>
                  {profile.name}
                </p>
              )}
              {profile.headline && (
                <h2 className={styles.role}>
                  {profile.headline}
                </h2>
              )}
              {profile.location && (
              <p className={styles.location}>
                  <HomeIcons.Location 
                    width={18} 
                    height={18} />
                    {profile.location}
                  <Image
                    src="/images/Ph-Flag.png"
                    width={12}
                    height={12}
                    alt="Avatar"
                    className={styles.avatar} />
              </p>
              )}
              <div className={styles.action}>
                  {profile.bookingUrl && (
                  <a 
                    href={profile.bookingUrl} 
                    target="_blank" 
                    className="liquid_glass_btn"
                    rel="noopener noreferrer">
                      <HomeIcons.Calendar 
                        width={18} 
                        height={18} />
                      Schedule a Call
                      <HomeIcons.ArrowRight 
                        width={18} 
                        height={18} />                                                                              
                  </a>
                  )}
                  {profile.email && (
                    <a 
                      href={`mailto:${profile.email}`}
                      className="liquid_glass_btn">
                        <HomeIcons.Message 
                          width={18} 
                          height={18} />
                        Send Email
                    </a>
                  )}
              </div>
          </div>
          <div className={styles.profile}>
            <SkeletonImage 
              path={profile.avatarUrl} 
              className={styles.avatar} 
              width={75} 
              height={75} 
              alt="Avatar" />
              <span className={styles["online-indicator"]}></span>
          </div>
        </>
    )
}