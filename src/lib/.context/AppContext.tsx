'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import useMediaQuery from "@/hooks/useMediaQuery";

import { theme, ThemeEnum } from "@/utils/types";
import { storageKeys } from "@/config/storageKeys";

type AppContextType = {
  pageLoading:  boolean;
  showModal:    boolean;
  setShowModal: (value: boolean) => void;
  isMobile:     boolean;
  isDark:       boolean;
  toggleTheme:  () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery(850);

  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [showModal,   setShowModal]   = useState<boolean>(false);
  const [isDark,      setIsDark]      = useState<boolean>(false);

  useEffect(() => {
    const savedTheme: theme | null = localStorage.getItem(storageKeys.local.theme) as theme | null;
    const prefersDark: boolean     = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark: boolean    = savedTheme === ThemeEnum.dark || (!savedTheme && prefersDark);

    const alreadyDark = document.documentElement.classList.contains(ThemeEnum.dark);

    if (shouldBeDark && !alreadyDark) {
      document.documentElement.classList.add(ThemeEnum.dark);
    } else if (!shouldBeDark && alreadyDark) {
      document.documentElement.classList.remove(ThemeEnum.dark);
    }

    setIsDark(shouldBeDark);
    setPageLoading(false);
  }, []);

  const toggleTheme = () => {
    const newIsDark: boolean = !isDark;
    const newTheme : theme   = newIsDark ? ThemeEnum.dark : ThemeEnum.light;

    document.documentElement.classList.toggle(ThemeEnum.dark, newIsDark);
    localStorage.setItem(storageKeys.local.theme, newTheme);

    setIsDark(newIsDark);
  };

  return (
    <AppContext.Provider value={{
      pageLoading,
      showModal,
      setShowModal,
      isMobile,
      isDark,
      toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useApp must be used within AppProvider");
  return context;
};