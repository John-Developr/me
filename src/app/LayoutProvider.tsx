'use client';

import { usePathname } from "next/navigation";
import { useMemo, useEffect } from "react";
import { site } from "@/config/siteConfig";
import Preloader from "@/containers/preloader-page/Preloader";

import ChatAIWrapper from "@/components/chat/ChatAIWrapper";
import Modal from "@/components/modal/Modal";

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isPublicRoute = useMemo(() => {
    return site.isPublic(pathname);
  }, [pathname]);

  if (isPublicRoute) {
    return (
      <Preloader>
        <PublicLayout>
          {children}
        </PublicLayout>
      </Preloader>
    )
  };

  return (
    <Preloader>
      <AdminLayout>
        {children}
      </AdminLayout>
    </Preloader>
  );
}

// 2. Extracted sub-layouts for better readability
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="wrapper">
    <main className="content">{children}</main>
    <ChatAIWrapper />
  </div>
);

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <div className="admin-wrapper">
      <main className="admin-content">{children}</main>
    </div>
    <Modal />
  </>
);

