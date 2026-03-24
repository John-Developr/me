'use client'

import React, { useRef } from "react";
import Image from "next/image";

import styles from "@/styles/pages/welcome.module.css";

import { useFadeOutRemove } from "@/hooks/useFadeOutRemove";
import { storageKeys } from "@/config/storageKeys";
import { OverlayType } from "@/utils/types";

import { OverlayState } from "./Preloader";

const WelcomeOverlay = ({
    isLoading,
    onUpdateOverlay,
}: {
    isLoading: boolean;
    onUpdateOverlay: (overlay: OverlayState | null) => void;
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useFadeOutRemove(wrapperRef, !isLoading, {
        delay: 5000,
        fadeOutClass: styles.fadeOut,
        callback: () => {
            localStorage.setItem(storageKeys.local.welcome, new Date().toDateString());
            onUpdateOverlay({
                type: OverlayType.welcome,
                visible: false
            })
        }
    });


    return (
        <div ref={wrapperRef} className={styles.wrapper}>
            <div className={`${styles.logo} ${styles.fadeInText}`}>
                <Image src="/Logo.png" width={75} height={17} alt="Logo" priority />
            </div>
            <main className={styles.main}>
                <p className={styles.fadeInText}>Powered by</p>
                <h1 className={styles.name}>JOHN CARLO A. YLANAN</h1>
                <h4 className={styles.title}>PORTFOLIO</h4>
            </main>
        </div>
    );
};

export default WelcomeOverlay;