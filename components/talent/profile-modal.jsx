"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { X, ArrowUpRight, LogOut, User, Camera } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { gradientFor } from "@/lib/gradients";
import { statusLabel } from "@/lib/format";

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="pressable mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-60"
    >
      <LogOut className="h-3.5 w-3.5" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function ProfileModal({ open, onClose, profile, talent }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const firstName = talent?.first_name || profile?.full_name?.split(" ")[0] || "—";
  const fullName =
    talent
      ? `${talent.first_name} ${talent.last_name}`
      : profile?.full_name || "—";
  const joined = talent?.contract_start_date || talent?.created_at;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-up-in relative w-[440px] max-w-[92vw] overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-pop)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/70 text-muted-foreground backdrop-blur transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div
          className="h-[88px]"
          style={{ background: gradientFor(talent?.id || profile?.id || "candor") }}
        />

        <div className="px-6 pb-6">
          <div className="-mt-9 flex items-end gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground text-[20px] font-medium text-background ring-4 ring-card">
              {talent?.polaroid_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={talent.polaroid_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                firstName[0]
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
                {fullName}
              </div>
              <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                {talent
                  ? `${statusLabel(talent.category)} · ${statusLabel(talent.primary_location)}`
                  : profile?.email}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-border/60 border-y border-border/60 py-3">
            <Stat label="Status" value={statusLabel(talent?.status) || "—"} />
            <Stat
              label="Joined"
              value={joined ? new Date(joined).getFullYear() : "—"}
            />
            <Stat
              label="Contract"
              value={
                talent?.contract_type
                  ? statusLabel(talent.contract_type).split(" ")[0]
                  : "—"
              }
            />
          </div>

          <div className="mt-4 space-y-0.5">
            <Row
              href="/talent/portfolio"
              onClose={onClose}
              icon={Camera}
              label="Portfolio"
            />
            <Row
              href="/talent/directory"
              onClose={onClose}
              icon={User}
              label="Talent directory"
            />
          </div>

          <form action={logout}>
            <LogoutButton />
          </form>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-[13px] font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}

function Row({ href, onClose, icon: Icon, label }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-muted"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="flex-1 text-[13px] font-medium text-foreground">{label}</div>
      <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
    </Link>
  );
}
