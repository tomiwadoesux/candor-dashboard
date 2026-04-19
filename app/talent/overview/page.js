"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  MapPin,
  Megaphone,
  Pin,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { bookings } from "@/lib/data";
import { useCommunity, useMe, useThreads } from "@/lib/store";
import { randomGradient } from "@/lib/gradients";

const KIND_META = {
  milestone: {
    label: "Milestone",
    icon: Sparkles,
    tone: "text-emerald-700 dark:text-emerald-400",
  },
  opportunity: {
    label: "Opportunity",
    icon: Megaphone,
    tone: "text-sky-700 dark:text-sky-400",
  },
  note: {
    label: "Note",
    icon: StickyNote,
    tone: "text-muted-foreground",
  },
};

const earnings = {
  ytd: "₦ 4,240,000",
  net: "₦ 3,392,000",
  pending: "₦ 720,000",
  currency: "NGN",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Night";
}

function MetaTile({ label, value, sub }) {
  return (
    <div className="group">
      <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </div>
      <div
        data-slot="numeric"
        className="mt-2 font-serif text-[30px] font-light tracking-[-0.02em] text-foreground"
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-[11.5px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

export default function TalentOverviewPage() {
  const me = useMe();
  const threads = useThreads();
  const community = useCommunity();
  const talentId = me?.id || "1";

  const wire = useMemo(
    () =>
      [...community]
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.at) - new Date(a.at);
        })
        .slice(0, 3),
    [community]
  );

  const mine = bookings.filter((b) => b.talentIds?.includes(talentId));
  const upcoming = mine
    .filter((b) => new Date(b.date) >= new Date("2026-01-01") && b.status !== "Cancelled")
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const next = upcoming[0];
  const rest = upcoming.slice(1, 4);

  // Randomised gradient — regenerated on each reload, keyed by talent + booking.
  const heroGradient = useMemo(
    () => randomGradient(`${talentId}-${next?.id || "0"}-${Date.now()}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [talentId, next?.id]
  );

  const recentComms = threads
    .slice(0, 2)
    .map((t) => ({
      id: t.id,
      title: t.subject,
      preview: t.messages[t.messages.length - 1]?.body || "",
      from: t.messages[t.messages.length - 1]?.authorKind === "admin"
        ? "From Candor"
        : "You",
      when: "recent",
      unread: true,
    }));

  const name = me?.stageName || "Zara";

  return (
    <div>
      <div className="pb-10 pt-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          {greeting()}, Candor · Talent
        </div>
        <h1 className="mt-1.5 font-serif text-[44px] font-light leading-[1.02] tracking-[-0.025em] text-foreground">
          {greeting()}, <span className="editorial-italic">{name}</span>.
        </h1>
        <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-muted-foreground">
          Here&rsquo;s what&rsquo;s live on your board — a confirmed shoot this week,
          two threads waiting, and commission on the way.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-x-10 gap-y-12">
        <div className="col-span-12 lg:col-span-7">
          <div className="flex items-baseline justify-between pb-5">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              Next · Confirmed
            </div>
            <Link
              href="/talent/bookings"
              className="group inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              All bookings
              <ArrowRight className="h-3 w-3 translate-x-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {next ? (
            <Link
              href="/talent/bookings"
              className="group block overflow-hidden rounded-[20px] border border-border bg-card"
            >
              <div
                className="relative aspect-[16/9] overflow-hidden"
                style={{ background: heroGradient }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.15]"
                  style={{
                    backgroundImage:
                      "radial-gradient(1px 1px at 20% 30%, currentColor 50%, transparent), radial-gradient(1px 1px at 70% 60%, currentColor 50%, transparent), radial-gradient(1px 1px at 40% 80%, currentColor 50%, transparent)",
                    backgroundSize: "120px 120px",
                    color: "oklch(0 0 0)",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-6 p-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.1em] text-foreground backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      {next.status}
                    </div>
                    <h2 className="mt-3 font-serif text-[32px] font-light leading-[1.1] tracking-[-0.02em] text-foreground">
                      {next.client}
                    </h2>
                    <div className="mt-1 flex items-center gap-3 text-[12px] text-foreground/80">
                      <span>{next.type}</span>
                      <span className="h-0.5 w-0.5 rounded-full bg-foreground/40" />
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {next.territory}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-foreground/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="px-6 py-4">
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                    Date
                  </div>
                  <div
                    data-slot="numeric"
                    className="mt-1 text-[13.5px] font-medium text-foreground"
                  >
                    {next.date}
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                    Fee
                  </div>
                  <div
                    data-slot="numeric"
                    className="mt-1 text-[13.5px] font-medium text-foreground"
                  >
                    {next.value}
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                    Usage
                  </div>
                  <div className="mt-1 truncate text-[13.5px] font-medium text-foreground">
                    {next.usageTerm}
                  </div>
                </div>
              </div>
            </Link>
          ) : null}

          <div className="mt-10">
            <div className="flex items-baseline justify-between pb-3">
              <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                Also coming up
              </div>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {rest.map((b) => (
                <li key={b.id}>
                  <Link
                    href="/talent/bookings"
                    className="hover-reveal group flex items-center gap-5 rounded-md px-1 py-4"
                  >
                    <div
                      data-slot="numeric"
                      className="w-14 shrink-0 font-serif text-[22px] font-light leading-none tracking-[-0.02em] text-foreground/80"
                    >
                      {b.date.slice(-2)}
                      <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">
                        {new Date(b.date).toLocaleString("en", { month: "short" })}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-medium text-foreground">
                        {b.client}
                      </div>
                      <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                        {b.type} · {b.territory}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        data-slot="numeric"
                        className="text-[12.5px] font-medium text-foreground"
                      >
                        {b.value}
                      </div>
                      <div
                        className={`mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.1em] ${
                          b.status === "Confirmed"
                            ? "text-success"
                            : b.status === "In Progress"
                              ? "text-warning"
                              : "text-muted-foreground"
                        }`}
                      >
                        {b.status}
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-muted-foreground/40 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
              {rest.length === 0 && (
                <li className="py-6 text-center text-[12px] text-muted-foreground">
                  Nothing else on the calendar yet.
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 lg:pl-4">
          <div>
            <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              Earnings · 2026
            </div>
            <div className="mt-5 grid grid-cols-2 gap-y-8">
              <MetaTile label="Gross YTD" value={earnings.ytd} sub={`${mine.length} bookings`} />
              <MetaTile label="Net received" value={earnings.net} sub="After 20% commission" />
              <MetaTile label="Awaiting" value={earnings.pending} sub="1 client paid, 1 pending" />
              <MetaTile label="Currency" value="NGN" sub="Primary ₦" />
            </div>
            <Link
              href="/talent/payments"
              className="mt-6 inline-flex items-center gap-1 border-b border-foreground/30 pb-0.5 text-[11.5px] font-medium text-foreground transition-colors hover:border-foreground"
            >
              Open statement
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-12">
            <div className="flex items-baseline justify-between pb-4">
              <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                From Candor
              </div>
              <Link
                href="/talent/communications"
                className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Open inbox
              </Link>
            </div>

            <ul className="space-y-2">
              {recentComms.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/talent/communications?thread=${c.id}`}
                    className="group block rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-[1px] hover:border-border-strong hover:shadow-[var(--shadow-lift)]"
                  >
                    <div className="flex items-start gap-3">
                      {c.unread && (
                        <span
                          aria-hidden
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-[13px] font-medium text-foreground">
                            {c.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {c.when}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-[12px] text-muted-foreground">
                          {c.preview}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
                            {c.from}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-warning">
                            <Clock className="h-2.5 w-2.5" /> Awaiting you
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              Portfolio
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="rule-between flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Comp card current
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="rule-between flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Digitals current
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="rule-between flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                  Next test shoot — April 1
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {wire.length > 0 && (
        <section className="mt-20">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-3">
            <div>
              <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                On the wire
              </div>
              <h2 className="mt-1 font-serif text-[24px] font-light text-foreground">
                From the <span className="editorial-italic">office</span>
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
              Updated by Candor
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-8 pt-8 md:grid-cols-3">
            {wire.map((p) => {
              const meta = KIND_META[p.kind] || KIND_META.note;
              const Icon = meta.icon;
              return (
                <li key={p.id} className="relative">
                  {p.pinned && (
                    <span className="absolute -left-3 top-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                      <Pin className="h-3 w-3" />
                    </span>
                  )}
                  <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]">
                    <Icon className={`h-3 w-3 ${meta.tone}`} />
                    <span className={meta.tone}>{meta.label}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="font-mono text-[9.5px] text-muted-foreground/60">
                      {p.author}
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-[19px] font-light leading-snug text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-20 border-t border-border pt-6">
        <p className="font-serif text-[12.5px] italic text-muted-foreground">
          Candor Management Agency · Lagos · London · USA
        </p>
      </div>
    </div>
  );
}
