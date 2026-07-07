"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";

const SidebarContext = createContext({
  collapsed: false,
  toggle: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

// One-time external read, hydration-safe: the server snapshot is `false`,
// the client snapshot reflects the persisted preference.
const emptySubscribe = () => () => {};
function useStoredCollapsed() {
  return useSyncExternalStore(
    emptySubscribe,
    () => localStorage.getItem("candor-sidebar-collapsed") === "1",
    () => false
  );
}

export function SidebarProvider({ children }) {
  const stored = useStoredCollapsed();
  const [override, setOverride] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const collapsed = override ?? stored;

  const toggle = () => {
    const next = !collapsed;
    localStorage.setItem("candor-sidebar-collapsed", next ? "1" : "0");
    setOverride(next);
  };

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
