"use client";

import { useTransition } from "react";
import Link from "next/link";
import { HelpCircle, Loader2, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";
import { logout } from "@/lib/actions/auth";

export function AdminTopbar({ profile, crumbs = [] }) {
  const [signingOut, startSignOut] = useTransition();
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="flex h-7 items-center gap-2 pl-1">
          <span className="font-serif text-[14px] italic text-foreground">
            Welcome, {firstName}
          </span>
          {profile?.role && (
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
              {statusLabel(profile.role)}
            </span>
          )}
        </div>

        {crumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
            <span className="text-muted-foreground/40">/</span>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className={cn(i === crumbs.length - 1 ? "text-foreground" : "")}>
                  {c}
                </span>
                {i < crumbs.length - 1 && (
                  <span className="text-muted-foreground/40">/</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => startSignOut(() => logout())}
          disabled={signingOut}
          className="pressable flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-60"
          aria-label="Log out"
          title="Log out"
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </button>
        <Link
          href="/admin/bookings/new"
          className="pressable ml-1 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground shadow-[var(--shadow-sink)] transition-colors hover:bg-primary/92"
        >
          <Plus className="h-3.5 w-3.5" />
          New booking
        </Link>
      </div>
    </header>
  );
}

export function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 pb-5">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
