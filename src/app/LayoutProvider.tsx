'use client'

import { Toaster } from "sileo";
import Preloader from "@/containers/preloader-page/Preloader";
import ChatAI from "@/components/chat/ChatAI";

import { useApp } from "@/lib/.context/AppContext";

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useApp();

  return (
    <>
      <Toaster position="top-right" theme={isDark ? "dark" : "light"} />
      <Preloader>
        <div className="wrapper">
          <main className="content">
            {children}
          </main>
          <ChatAI />
        </div>
      </Preloader>
    </>
  );
}