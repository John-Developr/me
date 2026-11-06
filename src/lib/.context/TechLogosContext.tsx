'use client'

import { createContext, ReactNode, useContext } from "react";

const TechLogosContext = createContext<Record<string, string>>({});

/**
 * Tool name → logo (from the Skills admin) for tech chips anywhere on the
 * site. Loaded once on the server in the root layout.
 */
export function TechLogosProvider({ logos, children }: { logos: Record<string, string>; children: ReactNode }) {
  return <TechLogosContext.Provider value={logos}>{children}</TechLogosContext.Provider>;
}

export const useTechLogos = (): Record<string, string> => useContext(TechLogosContext);
