"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const RailContext = createContext(null);

export const MODES = {
  DASHBOARD: "dashboard",
  PROFILE: "profile",
};

export function RailProvider({ children, initialMode = MODES.DASHBOARD }) {
  const [mode, setMode] = useState(initialMode);
  const [aiOpen, setAiOpen] = useState(false);

  const openAi = useCallback(() => setAiOpen(true), []);
  const closeAi = useCallback(() => setAiOpen(false), []);
  const toggleAi = useCallback(() => setAiOpen((v) => !v), []);

  const value = useMemo(
    () => ({ mode, setMode, aiOpen, openAi, closeAi, toggleAi }),
    [mode, aiOpen, openAi, closeAi, toggleAi]
  );

  return <RailContext.Provider value={value}>{children}</RailContext.Provider>;
}

export function useRail() {
  const ctx = useContext(RailContext);
  if (!ctx) throw new Error("useRail must be used inside RailProvider");
  return ctx;
}
