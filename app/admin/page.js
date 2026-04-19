import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  talent,
  bookings,
  invoices,
  notifications,
  openCastings,
  milestones,
  recentActivity,
} from "@/lib/data";

const TODAY = new Date("2026-04-18T20:00:00");

function fmtNgn(n) {
  if (n >= 1_000_000) return `₦ ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦ ${(n / 1_000).toFixed(0)}K`;
  return `₦ ${n}`;
}

function parseMoney(s) {
  return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}

function parseDate(d) {
  return new Date(`${d}T00:00:00`);
}

function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
      {children}
    </div>
  );
}

export default function AdminOverviewPage() {
  const activeTalent = talent.filter((t) => t.status === "Active").length;
  const onboarding = talent.filter(
    (t) => t.onboardingStep && t.onboardingStep < 8
  ).length;

  const monthBookings = bookings.filter((b) => {
    const d = parseDate(b.date);
    return d.getMonth() === TODAY.getMonth() && d.getFullYear() === TODAY.getFullYear();
  });

  const revenueMtd = monthBookings.reduce(
    (s, b) => s + parseMoney(b.value),
    0
  );
  const commissionMtd = Math.round(revenueMtd * 0.2);

  const overdueInvoices = invoices.filter((i) => i.status === "Overdue");
  const overdueAmount = overdueInvoices.reduce(
    (s, i) => s + parseMoney(i.amount),
    0
  );

  const awaitingResponses = notifications.filter(
    (n) =>
      ["availability_check", "booking_update"].includes(n.type) &&
      (n.responses?.length || 0) < (n.recipientIds?.length || 0)
  ).length;

  const pendingMilestones = milestones.filter((m) => !m.approved).length;

  const openCastingCount = openCastings.filter((c) => c.status === "Open").length;

  const onSetToday = bookings.filter((b) => {
    const s = parseDate(b.date);
    const e = parseDate(b.endDate || b.date);
    return TODAY >= s && TODAY <= e;
  });

  const upcomingWeek = bookings
    .filter((b) => {
      const s = parseDate(b.date);
      const diff = (s - TODAY) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 14;
    })
    .sort((a, b) => parseDate(a.date) - parseDate(b.date))
    .slice(0, 4);

  const priorityQueue = [
    ...overdueInvoices.map((i) => ({
      id: i.id,
      tone: "rose",
      label: `Invoice overdue · ${i.id}`,
      detail: `${i.client} · ${i.amount}`,
      age: `${Math.max(
        0,
        Math.round((TODAY - parseDate(i.dueDate || i.issuedDate)) / 86400000)
      )}d late`,
      href: "/admin/invoicing",
    })),
    ...bookings
      .filter((b) => b.status === "Pending" && !b.dealMemo)
      .slice(0, 2)
      .map((b) => ({
        id: b.id,
        tone: "amber",
        label: "Deal memo unsigned",
        detail: `${b.client} · ${b.type} · ${b.value}`,
        age: "Client waiting",
        href: "/admin/bookings",
      })),
    ...milestones
      .filter((m) => !m.approved)
      .slice(0, 2)
      .map((m) => ({
        id: m.id,
        tone: "sky",
        label: "Milestone awaiting approval",
        detail: `${m.talentName} · ${m.bookingTitle}`,
        age: "Needs CEO sign-off",
        href: "/admin/milestones",
      })),
    ...notifications
      .filter((n) => n.escalated)
      .slice(0, 1)
      .map((n) => ({
        id: n.id,
        tone: "rose",
        label: "Escalated — no response",
        detail: `${n.title}`,
        age: "Past threshold",
        href: "/admin/communications",
      })),
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <Eyebrow>
          {TODAY.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </Eyebrow>
        <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70">
          Talent Director · Lagos office
        </div>
      </div>
      <h1 className="font-serif text-[38px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        The <span className="editorial-italic">board</span>
      </h1>
      <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-muted-foreground">
        Two jobs on set, one invoice past due, {pendingMilestones} milestones
        awaiting your sign-off.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-x-10 gap-y-6 border-y border-border/60 py-6 md:grid-cols-6">
        <PulseStat label="On set" value={onSetToday.length} sub="Today" accent="emerald" />
        <PulseStat
          label="Active talent"
          value={activeTalent}
          sub={`${onboarding} onboarding`}
        />
        <PulseStat
          label="Bookings · month"
          value={monthBookings.length}
          sub={`${fmtNgn(revenueMtd)} gross`}
        />
        <PulseStat
          label="Commission · month"
          value={fmtNgn(commissionMtd)}
          sub="20% of gross"
        />
        <PulseStat
          label="Awaiting response"
          value={awaitingResponses}
          sub="Talent + clients"
        />
        <PulseStat
          label="Overdue"
          value={overdueInvoices.length}
          sub={overdueAmount ? fmtNgn(overdueAmount) : "All clear"}
          accent={overdueInvoices.length ? "rose" : null}
        />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
            <h2 className="font-serif text-[22px] font-light text-foreground">
              <span className="editorial-italic">On the board</span>
            </h2>
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              All bookings <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {onSetToday.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live now · on set
              </div>
              <ul className="divide-y divide-border/60 border-y border-border/60">
                {onSetToday.map((b) => (
                  <BoardRow key={b.id} booking={b} live />
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Next 14 days
            </div>
            <ul className="divide-y divide-border/60 border-y border-border/60">
              {upcomingWeek.map((b) => (
                <BoardRow key={b.id} booking={b} />
              ))}
              {upcomingWeek.length === 0 && (
                <li className="py-6 text-center text-[12px] text-muted-foreground">
                  Board is clear for the fortnight.
                </li>
              )}
            </ul>
          </div>
        </section>

        <aside className="lg:col-span-5">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
            <h2 className="font-serif text-[22px] font-light text-foreground">
              <span className="editorial-italic">Needs you</span>
            </h2>
            <span className="font-mono text-[10px] text-muted-foreground/70">
              {priorityQueue.length} item{priorityQueue.length === 1 ? "" : "s"}
            </span>
          </div>
          <ul className="mt-3 divide-y divide-border/60">
            {priorityQueue.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  className={`group relative flex items-start gap-3 py-3 pl-3 pr-2 transition-colors hover:bg-muted/40`}
                >
                  <span
                    className={`absolute left-0 top-3 h-10 w-[2px] ${toneToBar(p.tone)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] ${toneToText(p.tone)}`}
                    >
                      {p.label}
                    </div>
                    <div className="mt-1 truncate font-serif text-[15px] font-light text-foreground">
                      {p.detail}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {p.age}
                    </div>
                  </div>
                  <ArrowUpRight className="mt-1 h-3 w-3 shrink-0 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </li>
            ))}
            {priorityQueue.length === 0 && (
              <li className="py-6 text-center text-[12px] text-muted-foreground">
                Queue is empty.
              </li>
            )}
          </ul>

          <div className="mt-8 rounded-sm border border-border/60 bg-muted/30 p-4">
            <Eyebrow>This week · brief</Eyebrow>
            <p className="mt-2 font-serif text-[14px] font-light leading-relaxed text-foreground">
              <span className="editorial-italic">{openCastingCount}</span> open
              castings, <span className="editorial-italic">{pendingMilestones}</span>{" "}
              milestones pending approval, and Pepsi is closing pre-production
              Friday. Commission tracking on pace for Q2 target.
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-14">
        <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
          <h2 className="font-serif text-[22px] font-light text-foreground">
            <span className="editorial-italic">Wire</span>
          </h2>
          <Link
            href="/admin/communications"
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            All activity <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-border/60">
          {recentActivity.map((a) => (
            <li
              key={a.id}
              className="grid grid-cols-12 items-baseline gap-4 py-3"
            >
              <span className="col-span-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
                {a.time}
              </span>
              <div className="col-span-7 flex items-baseline gap-3">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                  {a.type}
                </span>
                <span className="text-[13px] text-foreground">{a.action}</span>
              </div>
              <span className="col-span-3 truncate text-right text-[11.5px] text-muted-foreground">
                {a.detail}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-20 border-t border-border pt-6">
        <p className="font-serif text-[12.5px] italic text-muted-foreground">
          Candor Management Agency · Lagos · London · USA
        </p>
      </div>
    </div>
  );
}

function PulseStat({ label, value, sub, accent }) {
  const accentColor =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : accent === "rose"
      ? "text-rose-700 dark:text-rose-400"
      : "text-foreground";
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </div>
      <div
        className={`mt-2 font-serif text-[30px] font-light leading-none tracking-[-0.02em] ${accentColor}`}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

function BoardRow({ booking: b, live }) {
  const s = parseDate(b.date);
  const e = parseDate(b.endDate || b.date);
  const sameDay = s.getTime() === e.getTime();
  const day = s.getDate();
  const dayEnd = e.getDate();
  const month = s.toLocaleString("en-GB", { month: "short" });

  const tone =
    b.status === "Confirmed" || b.status === "In Progress"
      ? "text-emerald-700 dark:text-emerald-400"
      : b.status === "Pending"
      ? "text-muted-foreground"
      : "text-sky-700 dark:text-sky-400";

  return (
    <li>
      <Link
        href="/admin/bookings"
        className="group grid grid-cols-12 items-start gap-x-4 py-4 transition-colors hover:bg-muted/30"
      >
        <div className="col-span-2 flex flex-col pl-2">
          <span className="font-serif text-[30px] font-light leading-none tracking-[-0.02em] text-foreground">
            {day}
            {!sameDay && (
              <span className="text-muted-foreground/50">–{dayEnd}</span>
            )}
          </span>
          <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            {month}
          </span>
        </div>
        <div className="col-span-7 min-w-0">
          <div className="truncate font-serif text-[18px] font-light text-foreground">
            {b.client}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">
            <span className="uppercase tracking-[0.1em]">{b.type}</span>
            <span>·</span>
            <span className="truncate">{b.talent}</span>
            <span>·</span>
            <span>{b.territory}</span>
          </div>
        </div>
        <div className="col-span-3 text-right">
          <div className="font-serif text-[16px] font-light text-foreground">
            {b.value}
          </div>
          <div className={`mt-0.5 text-[10px] uppercase tracking-[0.14em] ${tone}`}>
            {live ? "On set now" : b.status}
          </div>
        </div>
      </Link>
    </li>
  );
}

function toneToBar(t) {
  if (t === "rose") return "bg-rose-500";
  if (t === "amber") return "bg-amber-500";
  if (t === "sky") return "bg-sky-500";
  return "bg-muted-foreground";
}

function toneToText(t) {
  if (t === "rose") return "text-rose-700 dark:text-rose-400";
  if (t === "amber") return "text-amber-700 dark:text-amber-400";
  if (t === "sky") return "text-sky-700 dark:text-sky-400";
  return "text-muted-foreground";
}
