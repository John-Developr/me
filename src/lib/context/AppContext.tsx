'use client';

import { 
  createContext, 
  useContext, 
  useEffect,
  useState,
} from "react";

import { Detail } from "@/utils/types";
import { userAction } from "@/action/user";
import useMediaQuery from "@/hooks/useMediaQuery";

type AppContextType = {
  user: Detail | null;
  loading: boolean;

  showModal: boolean;
  setShowModal: (value: boolean) => void;

  isMobile: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery(850);
  const { user, fetchUser } = userAction()

  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  // init app
  useEffect(() => {
    const init = async () => {
      await fetchUser();
      setLoading(false);
    };

    init();
  }, []);


  return (
    <AppContext.Provider value={{ 
        user,
        loading,

        showModal, 
        setShowModal,

        isMobile
      }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) 
    throw new Error('useApp must be used within AppProvider');

  return context;
};