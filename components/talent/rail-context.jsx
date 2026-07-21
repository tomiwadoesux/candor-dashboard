"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const RailContext = createContext(null);

export const MODES = {
  DASHBOARD: "dashboard",
  PROFILE: "profile",
};

const PROFILE_ROUTES = ["/talent/portfolio", "/talent/directory"];

// Mode is derived from the route, so the rail and sidebar can never drift
// out of sync with where the user actually is.
export function RailProvider({ children }) {
  const pathname = usePathname();
  const mode = PROFILE_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  )
    ? MODES.PROFILE
    : MODES.DASHBOARD;

  const [aiOpen, setAiOpen] = useState(false);

  const openAi = useCallback(() => setAiOpen(true), []);
  const closeAi = useCallback(() => setAiOpen(false), []);
  const toggleAi = useCallback(() => setAiOpen((v) => !v), []);

  const value = useMemo(
    () => ({ mode, aiOpen, openAi, closeAi, toggleAi }),
    [mode, aiOpen, openAi, closeAi, toggleAi]
  );

  return <RailContext.Provider value={value}>{children}</RailContext.Provider>;
}

export function useRail() {
  const ctx = useContext(RailContext);
  if (!ctx) throw new Error("useRail must be used inside RailProvider");
  return ctx;
}
