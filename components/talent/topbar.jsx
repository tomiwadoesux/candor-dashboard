"use client";

import Link from "next/link";
import { Bell, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { ProfileModal } from "@/components/talent/profile-modal";

// Theme is initialised by the pre-paint script in the root layout; this
// toggle just flips the class and persists the choice.
function toggleTheme() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  localStorage.setItem("candor-theme", next ? "dark" : "light");
}

export function TalentTopbar({ profile, talent, unread = 0 }) {
  const [profileOpen, setProfileOpen] = useState(false);

  const initial = talent?.first_name?.[0] || profile?.full_name?.[0] || "C";

  return (
    <>
      <header className="flex shrink-0 items-center justify-end gap-1 px-6 pt-5 md:px-10">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="pressable flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <span className="relative flex h-4 w-4 items-center justify-center">
            <Sun className="absolute h-4 w-4 rotate-0 scale-100 opacity-100 transition-[transform,opacity] duration-200 ease-out dark:rotate-90 dark:scale-90 dark:opacity-0" />
            <Moon className="absolute h-4 w-4 -rotate-90 scale-90 opacity-0 transition-[transform,opacity] duration-200 ease-out dark:rotate-0 dark:scale-100 dark:opacity-100" />
          </span>
        </button>

        <Link
          href="/talent/communications"
          aria-label={unread > 0 ? `Messages — ${unread} unread` : "Messages"}
          className="pressable relative flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span
              aria-hidden
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand ring-2 ring-background"
            />
          )}
        </Link>

        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          aria-label="Open profile"
          className="pressable ml-1.5 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-foreground text-[12.5px] font-medium text-background ring-1 ring-border"
        >
          {talent?.polaroid_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={talent.polaroid_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
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
