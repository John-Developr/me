'use client'

import React, { useRef } from "react";

import styles from "@/styles/pages/welcome.module.css";

import { useFadeOutRemove } from "@/hooks/useFadeOutRemove";
import { OverlayType } from "@/utils/types";

import { OverlayState } from "./Preloader";

const SpinnerOverlay =  ({
    isLoading,
    onUpdateOverlay,
}: {
    isLoading: boolean;
    onUpdateOverlay: (overlay: OverlayState | null) => void;
}) => {

    const wrapperRef = useRef<HTMLDivElement>(null);

    useFadeOutRemove(wrapperRef, !isLoading, {
        delay: 300,
        fadeOutClass: styles.fadeOut,
        callback: () => {
            onUpdateOverlay({
                type: OverlayType.preloader,
                visible: false
            })
        }
    });

     return (
        <div ref={wrapperRef} className={styles["preloader-wrapper"]}>
            <div className={styles.spinner} />
        </div>
     )
}

export default SpinnerOverlay;