'use client'

import styles from "@/styles/admin/profile.module.css"
import Edit from "@/components/icons/Edit";

import { useRef } from "react";
import { userAction } from "@/action/user";

import SkeletonImage from "@/components/custom/SkeletonImage";
import { useApp } from "@/lib/context/AppContext";

export default function ProfilePicture() {
    const { user } = useApp();
    const { updateProfile } = userAction();
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={styles.profile}>
            <SkeletonImage
                path={user?.profile}
                className=""
                width={150}
                height={150}
                alt="avatar" />
            <button 
                className={styles.change}
                onClick={() => {
                    fileInputRef.current?.click();
                }}>
                <Edit 
                    width={17} 
                    height={17} />
            </button>
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={updateProfile} />
        </div>
    );
}
