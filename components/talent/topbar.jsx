"use client";

import Link from "next/link";
import { Bell, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { ProfileModal } from "@/components/talent/profile-modal";

export function TalentTopbar({ profile, talent, unread = 0 }) {
  const [profileOpen, setProfileOpen] = useState(false);

  // The .dark class on <html> is the single source of truth — the icons flip
  // via CSS dark: variants, so no theme state lives in React.
  useEffect(() => {
    const stored = localStorage.getItem("candor-theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : Boolean(prefersDark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("candor-theme", next ? "dark" : "light");
  };

  const initial =
    talent?.first_name?.[0] || profile?.full_name?.[0] || "C";

  return (
    <>
      <header className="flex shrink-0 items-center justify-end gap-1.5 px-10 pt-6">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="pressable flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-muted text-muted-foreground transition-colors hover:border-border-strong hover:bg-surface hover:text-foreground"
        >
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <Sun className="absolute h-3.5 w-3.5 rotate-0 scale-100 opacity-100 transition-[transform,opacity] duration-200 ease-out dark:rotate-90 dark:scale-90 dark:opacity-0" />
            <Moon className="absolute h-3.5 w-3.5 -rotate-90 scale-90 opacity-0 transition-[transform,opacity] duration-200 ease-out dark:rotate-0 dark:scale-100 dark:opacity-100" />
          </span>
        </button>

        <Link
          href="/talent/communications"
          aria-label={
            unread > 0 ? `Communications — ${unread} unread` : "Communications"
          }
          className="pressable relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-muted text-muted-foreground transition-colors hover:border-border-strong hover:bg-surface hover:text-foreground"
        >
          <Bell className="h-3.5 w-3.5" />
          {unread > 0 && (
            <span
              aria-hidden
              className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-bronze"
            />
          )}
        </Link>

        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          aria-label="Open profile"
          className="pressable relative ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-[12px] font-medium text-background ring-1 ring-border transition-transform hover:scale-105"
        >
          {initial}
          <span
            aria-hidden
            className="dot-pulse absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-background"
          />
        </button>
      </header>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        talent={talent}
      />
    </>
  );
}
