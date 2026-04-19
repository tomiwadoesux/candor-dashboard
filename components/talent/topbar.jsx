"use client";

import { Bell, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationsPopover } from "@/components/shared/notifications-popover";
import { ProfileModal } from "@/components/talent/profile-modal";
import { useMe } from "@/lib/store";

export function TalentTopbar() {
  const [theme, setTheme] = useState("light");
  const [profileOpen, setProfileOpen] = useState(false);
  const me = useMe();

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("candor-theme") : null;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial = stored || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("candor-theme", next);
  };

  const initial = me?.stageName?.[0] || me?.name?.[0] || "Z";

  return (
    <>
      <header className="flex shrink-0 items-center justify-end gap-1.5 px-10 pt-6">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-muted text-muted-foreground transition-colors hover:border-border-strong hover:bg-surface hover:text-foreground"
        >
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <Sun
              className={cn(
                "absolute h-3.5 w-3.5 transition-all duration-300",
                theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              )}
            />
            <Moon
              className={cn(
                "absolute h-3.5 w-3.5 transition-all duration-300",
                theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
              )}
            />
          </span>
        </button>

        <NotificationsPopover />

        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          aria-label="Open profile"
          className="relative ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-[12px] font-medium text-background ring-1 ring-border transition-transform hover:scale-105"
        >
          {initial}
          <span
            aria-hidden
            className="dot-pulse absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-background"
          />
        </button>
      </header>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
