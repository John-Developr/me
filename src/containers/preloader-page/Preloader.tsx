'use client'

import React from "react";
import { useEffect, useState, ReactNode, useRef, useCallback } from "react";
import { useApp } from "@/lib/.context/AppContext";
import { WelcomeOverlay, SpinnerOverlay } from "./Overlays";

type PreloaderProps = {
  children: ReactNode;
};

export enum OverlayType {
  welcome = "welcome",
  preloader = "preloader"
}

export type OverlayState = {
  type: OverlayType;
  visible: boolean;
};

const MainContent = React.memo(({ children }: { children: ReactNode }) => {
  return <>{children}</>;
});

MainContent.displayName = "MainContent";

export default function Preloader({  children }: PreloaderProps) {
  const { loading } = useApp();
  const [overlay, setOverlay] = useState<OverlayState | null>(null)

  const updateOverlay = useCallback((value: OverlayState | null) => {
    setOverlay(value)
  }, []);

  // For (DEV) purposes only
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log("Preloader render count:", renderCount.current);

  // decide if welcome should show (once per day)
  useEffect(() => {
    if (typeof window === 'undefined') 
      return;

    const lastShown = localStorage.getItem('welcomeLastShown');
    const today = new Date().toDateString();

    if (lastShown !== today) {
      setOverlay({
        type: OverlayType.welcome, 
        visible: true 
      })
    } else {
      setOverlay({
        type: OverlayType.preloader, 
        visible: true
      })
    }
  }, []);
  
  return (
    <>
      {/* Pre loader Overlay */}
      {(overlay && 
          overlay.visible && 
          overlay.type == OverlayType.preloader) && (
          <SpinnerOverlay 
            isLoading={loading}
            onUpdateOverlay={updateOverlay} />
      )}

      {/* Welcome Overlay */}
      {(overlay && 
          overlay.visible && 
          overlay.type == OverlayType.welcome) && (
          <WelcomeOverlay 
            isLoading={loading} 
            onUpdateOverlay={updateOverlay} />
      )}

      {/* Main Content */}
      {!loading && <MainContent>{children}</MainContent>}
    </>
  );
}
