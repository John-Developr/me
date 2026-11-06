'use client'

import { Toaster } from "sileo";
import { usePathname } from "next/navigation";
import Preloader from "@/containers/preloader-page/Preloader";
import ChatAI from "@/components/chat/ChatAI";
import PageViewTracker from "@/components/analytics/PageViewTracker";

import { useApp } from "@/lib/.context/AppContext";
import { SiteProfileProvider } from "@/lib/.context/SiteProfileContext";
import { TechLogosProvider } from "@/lib/.context/TechLogosContext";
import { PublicProfile } from "@/utils/types";

interface LayoutProviderProps {
  profile:   PublicProfile;
  techLogos: Record<string, string>;
  children:  React.ReactNode;
}

export default function LayoutProvider({ profile, techLogos, children }: LayoutProviderProps) {
  const { isDark } = useApp();
  const pathname   = usePathname();

  // The admin area has its own full-width shell: no preloader, content column or chat.
  const isAdmin = pathname === "/admin" || pathname?.startsWith("/admin/");

  return (
    <SiteProfileProvider profile={profile}>
    <TechLogosProvider logos={techLogos}>
      <Toaster position="top-right" theme={isDark ? "dark" : "light"} />
      {isAdmin ? children : (
        <Preloader>
          <div className="wrapper">
            <main className="content">
              {children}
            </main>
            <ChatAI />
          </div>
          <PageViewTracker />
        </Preloader>
      )}
    </TechLogosProvider>
    </SiteProfileProvider>
  );
}
