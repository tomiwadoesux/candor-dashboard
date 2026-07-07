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
      className="pressable mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border text-[12.5px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-60"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-up-in relative w-[440px] max-w-[92vw] overflow-hidden rounded-xl border border-border bg-background shadow-[var(--shadow-lift)]"
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
          className="h-[96px]"
          style={{ background: gradientFor(talent?.id || profile?.id || "candor") }}
        />

        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground text-[20px] font-serif italic text-background shadow-[var(--shadow-lift)] ring-4 ring-background">
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
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                {talent
                  ? `${statusLabel(talent.category)} · ${statusLabel(talent.primary_location)}`
                  : "Candor · Talent"}
              </div>
              <div className="truncate font-serif text-[24px] font-light italic leading-tight text-foreground">
                {firstName}
              </div>
              <div className="truncate text-[11.5px] text-muted-foreground">
                {fullName}
                {profile?.email ? ` · ${profile.email}` : ""}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-0 divide-x divide-border/60 border-y border-border/60 py-3">
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

          {talent?.bio && (
            <p className="mt-4 line-clamp-4 text-[12.5px] leading-relaxed text-muted-foreground">
              {talent.bio}
            </p>
          )}

          <div className="mt-5 space-y-0.5">
            <Row
              href="/talent/portfolio"
              onClose={onClose}
              icon={Camera}
              label="Portfolio"
              sub="Measurements, comp card, selected works"
            />
            <Row
              href="/talent/directory"
              onClose={onClose}
              icon={User}
              label="Talent directory"
              sub="The Candor roster"
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
      <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 truncate font-serif text-[15px] italic text-foreground">
        {value}
      </div>
    </div>
  );
}

function Row({ href, onClose, icon: Icon, label, sub }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface-muted"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-medium text-foreground">{label}</div>
        <div className="truncate text-[11px] text-muted-foreground">{sub}</div>
      </div>
      <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
    </Link>
  );
}
