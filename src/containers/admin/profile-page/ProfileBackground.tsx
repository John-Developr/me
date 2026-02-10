'use client'

import Image from "next/image";

import styles from "@/styles/admin/profile.module.css"
import Edit from "@/components/icons/Edit";
import ProfilePicture from "./ProfilePicture";

import { me } from "@/config/personalConfig";

export default function ProfileBackground() {
    return (
        <div className={styles.cover}>
            <ProfilePicture />
            <button 
                className={styles.change}>
                <Edit 
                    width={17} 
                    height={17} />
            </button>
        </div>
    );
}
