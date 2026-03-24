'use client'

import React from "react";
import { useEffect, useState, ReactNode, useCallback } from "react";

import { useApp } from "@/lib/.context/AppContext";
import { storageKeys } from "@/config/storageKeys";
import { OverlayType } from "@/utils/types";

import SpinnerOverlay from "./SpinnerOverlay";
import WelcomeOverlay from "./WelcomeOverlay";

export type OverlayState = {
  type: OverlayType;
  visible: boolean;
};

export default function Preloader({ children }: { children: ReactNode }) {
  const { pageLoading } = useApp();
  const [overlay, setOverlay] = useState<OverlayState | null>(null)

  const updateOverlay = useCallback((value: OverlayState | null) => {
    setOverlay(value)
  }, []);

  useEffect(() => {
    const lastShown: string | null = localStorage.getItem(storageKeys.local.welcome);
    const today: string = new Date().toDateString();

    if (lastShown !== today) {
      setOverlay({ type: OverlayType.welcome,   visible: true });
    } else {
      setOverlay({ type: OverlayType.preloader, visible: true });
    }
  }, []);

  const showPreloader: boolean | undefined = overlay?.visible && overlay.type === OverlayType.preloader;
  const showWelcome: boolean | undefined   = overlay?.visible && overlay.type === OverlayType.welcome;
  
  return (
    <>
      {/* Pre loader Overlay */}
      {showPreloader && (
        <SpinnerOverlay
          isLoading={pageLoading}
          onUpdateOverlay={updateOverlay}
        />
      )}

      {/* Welcome Overlay */}
      {showWelcome && (
        <WelcomeOverlay
          isLoading={pageLoading}
          onUpdateOverlay={updateOverlay}
        />
      )}

      {/* Main Content */}
      {!pageLoading && <>{children}</>}
    </>
  );
}
