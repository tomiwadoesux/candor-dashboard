"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

const ThemeContext = createContext({ theme: "light", toggle: () => {} });

// One-time external read, hydration-safe: the server snapshot is "light",
// the client snapshot reflects the stored preference or the OS setting.
const emptySubscribe = () => () => {};
function useStoredTheme() {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      const stored = localStorage.getItem("candor-theme");
      if (stored) return stored;
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    },
    () => "light"
  );
}

export function ThemeProvider({ children }) {
  const stored = useStoredTheme();
  const [override, setOverride] = useState(null);
  const theme = override ?? stored;

  // Sync the external system (document class) with the resolved theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("candor-theme", next);
    setOverride(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
