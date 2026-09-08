"use client";

import {
  CalendarBlank,
  MapPin,
  Clock,
  Megaphone,
  ArrowRight,
  Wallet,
  CaretRight,
  ChatCircleDots,
  Trophy,
  FileText,
  FilmSlate,
} from "@phosphor-icons/react";
import { initials } from "./roster";
import { STATUS, dayLabel, dateLabel } from "./bookings-data";

/*
  HOME — dense. One screen, no scrolling, everything at a glance.
  Row 1: next job (widest) · earnings · open call.
  Row 2: rest of the month · latest messages.
  Row 3: small counters that link out.
*/

const MESSAGES = [
  { id: 1, from: "Nadia Okonkwo", text: "Bottega confirmed the fitting for Tuesday…", time: "09:52" },
  { id: 2, from: "Tunde Bakare", text: "Call sheet for Selfridges lands tonight.", time: "10:31" },
  { id: 3, from: "Elise Moreau", text: "Client asked for a clean face on the day.", time: "11:06" },
  { id: 4, from: "Folake Adeniyi", text: "Great feedback from Acne — they want you back.", time: "08:20" },
  { id: 5, from: "Nadia Okonkwo", text: "Send me your March availability when you can.", time: "Yest" },
  { id: 6, from: "Tunde Bakare", text: "Loewe casting moved to Tuesday afternoon.", time: "Yest" },
];

const GREEN = "oklch(0.41 0.072 168)";

function Tile({ className = "", style = {}, children }) {
  return (
    <section
      style={{
        borderRadius: "var(--inner-radius, 16px)",
        ...style,
      }}
      className={`border border-border bg-surface p-4 shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </section>
  );
}

function TileHeader({ icon: Icon, title, action, onAction }) {
  return (
    <header className="flex items-center gap-1.5">
      {Icon ? <Icon size={13} className="text-muted-foreground" /> : null}
      <h3 className="text-[12px] font-semibold text-foreground">{title}</h3>
      {action ? (
        <button
          type="button"
          onClick={onAction}
          className="ml-auto flex items-center gap-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {action}
          <CaretRight size={10} />
        </button>
      ) : null}
    </header>
  );
}

export function HomeOverview({ bookings, onGoTo, cardGap, innerRadius }) {
  // The month, straight off the shared book: the very next job gets the hero
  // tile, everything after it fills the list underneath.
  const upcoming = bookings
    .filter((b) => STATUS[b.status].group !== "past")
    .sort((a, b) => a.on.localeCompare(b.on));
  const nextJob = upcoming[0] ?? null;
  const rest = upcoming.slice(1);
  const gapStyle = cardGap != null ? (typeof cardGap === "number" ? `${cardGap}px` : cardGap) : "var(--card-gap, 16px)";
  const radiusStyle = innerRadius != null ? (typeof innerRadius === "number" ? `${innerRadius}px` : innerRadius) : "var(--inner-radius, 16px)";

  return (
    <div
      style={{
        padding: gapStyle,
        gap: "12px",
      }}
      className="flex h-full flex-col overflow-y-auto"
    >
      <div className="flex w-full flex-1 flex-col gap-3">
        {/* Row 1 — next job, money, open call */}
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
          <Tile>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[9.5px] font-bold tracking-[0.06em] text-brand-soft-foreground uppercase">
                Up next · {dayLabel(nextJob.on)}
              </span>
              <span className="ml-auto font-mono text-[13.5px] font-semibold text-foreground">
                {nextJob.fee}
              </span>
            </div>
            <p className="mt-2 text-[15px] leading-tight font-semibold tracking-[-0.01em] text-foreground">
              {nextJob.client}
            </p>
            <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{nextJob.title}</p>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-foreground">
              <span className="flex items-center gap-1">
                <CalendarBlank size={12} className="text-muted-foreground" />
                {dateLabel(nextJob.on)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-muted-foreground" />
                {nextJob.call}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-muted-foreground" />
                {nextJob.venue}
              </span>
            </div>
            <p className="mt-2 truncate rounded-lg bg-surface-muted/60 px-2.5 py-1.5 text-[11px] text-foreground">
              <span className="font-semibold text-muted-foreground">Bring · </span>
              {nextJob.bring.join(" · ")}
            </p>
          </Tile>

          <Tile>
            <TileHeader icon={Wallet} title="March" action="Payments" onAction={() => onGoTo?.("payments")} />
            <p className="mt-3 font-mono text-[24px] leading-none font-semibold text-foreground">
              $11,600
            </p>
            <p className="mt-1 text-[10.5px] text-muted-foreground">Cleared</p>
            <div className="mt-2.5 flex items-baseline gap-1.5 border-t border-border/60 pt-2">
              <span className="font-mono text-[13px] font-medium text-muted-foreground">$5,550</span>
              <span className="text-[10.5px] text-muted-foreground">pending</span>
            </div>
          </Tile>

          <Tile className="flex flex-col">
            <div className="flex items-center gap-2">
              <span style={{ color: GREEN }} className="flex items-center justify-center shrink-0">
                <Megaphone size={15} weight="fill" />
              </span>
              <span
                style={{ background: GREEN }}
                className="flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.07em] text-white uppercase shrink-0"
              >
                Open call
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-snug font-medium text-foreground">
              Zara SS27 lookbook — one spot open
            </p>
            <p className="mt-0.5 text-[10.5px] text-muted-foreground">Fri 13 Mar · $2,400</p>
            <button
              type="button"
              onClick={() => onGoTo?.("messages")}
              style={{ background: GREEN }}
              className="mt-auto flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[11.5px] font-semibold text-white transition-[filter,transform] duration-140 ease-[var(--ease-out)] hover:brightness-110 active:scale-[0.98]"
            >
              Claim it
              <ArrowRight size={12} weight="bold" />
            </button>
          </Tile>
        </div>

        {/* Row 2 — the month, and what people said */}
        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
          <Tile className="flex min-h-0 flex-col">
            <TileHeader title="This month" action="All bookings" onAction={() => onGoTo?.("bookings")} />
            <ul className="mt-1.5 min-h-0 flex-1 divide-y divide-border/50 overflow-y-auto">
              {rest.map((job) => (
                <li key={job.id} className="flex items-center gap-2.5 py-[7px]">
                  <span className="w-[46px] shrink-0 text-[10.5px] tabular-nums text-muted-foreground">
                    {dayLabel(job.on)}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[12px] text-foreground">
                    <span className="font-medium">{job.client}</span>
                    <span className="text-muted-foreground"> · {job.kind} · {job.city}</span>
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-medium ${
                      job.status === "confirmed"
                        ? "bg-brand-soft text-brand-soft-foreground"
                        : "bg-surface-muted text-muted-foreground"
                    }`}
                  >
                    {STATUS[job.status].label}
                  </span>
                </li>
              ))}
            </ul>
          </Tile>

          <Tile className="flex min-h-0 flex-col">
            <TileHeader icon={ChatCircleDots} title="Messages" action="Open inbox" onAction={() => onGoTo?.("messages")} />
            <ul className="mt-1.5 min-h-0 flex-1 divide-y divide-border/50 overflow-y-auto">
              {MESSAGES.map((m) => (
                <li key={m.id} className="flex items-center gap-2.5 py-[7px]">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-muted text-[8.5px] font-semibold text-foreground">
                    {initials(m.from)}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[12px] text-foreground">
                    <span className="font-medium">{m.from.split(" ")[0]}</span>
                    <span className="text-muted-foreground"> — {m.text}</span>
                  </p>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {m.time}
                  </span>
                </li>
              ))}
            </ul>
          </Tile>
        </div>

        {/* Row 3 — counters that link out */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Trophy, label: "Milestones", value: "2 pending approval", tab: "milestones" },
            { icon: FileText, label: "Documents", value: "1 due — Bottega NDA", tab: "documents" },
            { icon: FilmSlate, label: "Casting invites", value: "3 open this week", tab: "castings" },
          ].map(({ icon: Icon, label, value, tab }) => (
            <button
              key={label}
              type="button"
              onClick={() => onGoTo?.(tab)}
              style={{
                borderRadius: radiusStyle,
              }}
              className="flex items-center gap-3 border border-border bg-surface px-4 py-3 text-left shadow-[var(--shadow-soft)] transition-colors hover:bg-surface-muted"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-surface-muted">
                <Icon size={15} className="text-foreground" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold text-foreground">{label}</span>
                <span className="block truncate text-[10.5px] text-muted-foreground">{value}</span>
              </span>
              <CaretRight size={12} className="ml-auto shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
