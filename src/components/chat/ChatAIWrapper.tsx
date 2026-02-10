"use client";

import { usePathname } from "next/navigation";
import ChatAI from "./ChatAI";
import { site } from "@/config/siteConfig";

export default function ChatAIWrapper() {
  const pathname = usePathname();

  const isValidPath = site.getPublicRoutes().some((path: string) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isValidPath) return null;

  return <ChatAI />;
}