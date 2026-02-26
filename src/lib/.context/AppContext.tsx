'use client';

import { 
  createContext, 
  useContext, 
  useEffect,
  useState,
} from "react";

import { usePathname } from 'next/navigation';
import useMediaQuery from "@/hooks/useMediaQuery";
import { AIBlogResponse } from "@/utils/types";
import { networkDefine } from "@/config/networkDefine";

type AppContextType = {
  pageLoading: boolean;
  
  blogs: SetBlogsType | undefined;
  setBlogs: (value: SetBlogsType | undefined) => void;

  showModal: boolean;
  setShowModal: (value: boolean) => void;

  isMobile: boolean;
};

interface SetBlogsType {
  recent: AIBlogResponse[];
  all: AIBlogResponse[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useMediaQuery(850);
  
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [blogs, setBlogs] = useState<SetBlogsType | undefined>();
  const [showModal, setShowModal] = useState<boolean>(false);
  
  // init app
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(networkDefine.BLOG_API);
        if (!response.ok) {
          throw new Error("Failed to fetch blogs.");
        }

        const { blogs } = await response.json();

        setBlogs({
          recent: (blogs || []).slice(0, 2),
          all: blogs || [],
        });

      } catch (error) {
        console.error(error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchBlogs();
  }, [pathname]);

  return (
    <AppContext.Provider value={{ 
        pageLoading: pageLoading,

        blogs,
        setBlogs,

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