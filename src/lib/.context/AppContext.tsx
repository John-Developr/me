'use client';

import { 
  createContext, 
  useContext, 
  useEffect,
  useState,
} from "react";

import { AIBlogResponse } from "@/utils/types";
import useMediaQuery from "@/hooks/useMediaQuery";

type AppContextType = {
  loading: boolean;
  
  blogs: SetBlogsType | undefined;

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
  const isMobile = useMediaQuery(850);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [blogs, setBlogs] = useState<SetBlogsType>();
  const [showModal, setShowModal] = useState<boolean>(false);
  
  // init app
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`/api/blog`);

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
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <AppContext.Provider value={{ 
        loading,

        blogs,

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