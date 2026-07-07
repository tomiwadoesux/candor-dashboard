import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  MapPin,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { talentOverview } from "@/lib/queries/dashboard";
import { getMyTalentProfile } from "@/lib/queries/talent";
import { gradientFor } from "@/lib/gradients";
import { dateShort, money, relativeTime, statusLabel } from "@/lib/format";
import { moneyTotals } from "@/components/talent/money-totals";
import { bookingTone } from "@/components/talent/status-tones";

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

export default async function TalentOverviewPage() {
  const [overview, me] = await Promise.all([
    talentOverview(),
    getMyTalentProfile(),
  ]);

  const {
    bookingsYtdCount,
    earningsYtdNet,
    pendingPaymentNet,
    nextBooking,
    upcomingBookings,
    latestComms,
    community,
  } = overview;

  const name = me?.first_name || "there";
  const heroGradient = gradientFor(me?.id ?? "candor");
  const rest = upcomingBookings.filter((b) => b.id !== nextBooking?.id);
  const nextTone = nextBooking ? bookingTone(nextBooking.status) : null;

  const wire = [
    ...community.milestones.map((m) => ({
      kind: "milestone",
      id: `m-${m.id}`,
      title: m.display_text,
      sub: relativeTime(m.created_at),
      href: "/talent/milestones",
    })),
    ...community.castings.map((c) => ({
      kind: "casting",
      id: `c-${c.id}`,
      title: c.title,
      sub: `${statusLabel(c.category)} · ${statusLabel(c.location)} · closes ${relativeTime(c.deadline)}`,
      href: "/talent/castings",
    })),
  ].slice(0, 3);

  return (
    <div>
      <div className="pb-10 pt-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Candor · Talent
        </div>
        <h1 className="mt-1.5 font-serif text-[44px] font-light leading-[1.02] tracking-[-0.025em] text-foreground">
          {greeting()}, <span className="editorial-italic">{name}</span>.
        </h1>
        <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-muted-foreground">
          Here&rsquo;s what&rsquo;s live on your board — bookings, payments and
          the latest from the Candor office.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-x-10 gap-y-12">
        <div className="col-span-12 lg:col-span-7">
          <div className="flex items-baseline justify-between pb-5">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              {nextBooking ? `Next · ${statusLabel(nextBooking.status)}` : "Next up"}
            </div>
            <Link
              href="/talent/bookings"
              className="group inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              All bookings
              <ArrowRight className="h-3 w-3 translate-x-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {nextBooking ? (
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
                      <span className={`h-1.5 w-1.5 rounded-full ${nextTone.dot}`} />
                      {statusLabel(nextBooking.status)}
                    </div>
                    <h2 className="mt-3 font-serif text-[32px] font-light leading-[1.1] tracking-[-0.02em] text-foreground">
                      {nextBooking.project_title}
                    </h2>
                    <div className="mt-1 flex items-center gap-3 text-[12px] text-foreground/80">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {statusLabel(nextBooking.location_city)}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-foreground/60 transition-[transform,color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
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
                    {dateShort(nextBooking.booking_date)}
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
                    {money(nextBooking.talent_fee, nextBooking.fee_currency)}
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                    Usage
                  </div>
                  <div className="mt-1 truncate text-[13.5px] font-medium text-foreground">
                    {nextBooking.media_usage || "—"}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-[20px] border border-dashed border-border bg-surface-muted/40 p-12 text-center">
              <p className="font-serif text-[18px] italic text-foreground/90">
                No bookings yet.
              </p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Your booker will confirm your first job soon.
              </p>
            </div>
          )}

          <div className="mt-10">
            <div className="flex items-baseline justify-between pb-3">
              <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                Also coming up
              </div>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {rest.map((b) => {
                const tone = bookingTone(b.status);
                const d = new Date(b.booking_date);
                return (
                  <li key={b.id}>
                    <Link
                      href="/talent/bookings"
                      className="hover-reveal group flex items-center gap-5 rounded-md px-1 py-4"
                    >
                      <div
                        data-slot="numeric"
                        className="w-14 shrink-0 font-serif text-[22px] font-light leading-none tracking-[-0.02em] text-foreground/80"
                      >
                        {d.getDate()}
                        <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">
                          {d.toLocaleString("en-GB", { month: "short" })}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-medium text-foreground">
                          {b.project_title}
                        </div>
                        <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                          {statusLabel(b.location_city)}
                          {b.media_usage ? ` · ${b.media_usage}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          data-slot="numeric"
                          className="text-[12.5px] font-medium text-foreground"
                        >
                          {money(b.talent_fee, b.fee_currency)}
                        </div>
                        <div
                          className={`mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.1em] ${tone.text}`}
                        >
                          {statusLabel(b.status)}
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-muted-foreground/40 opacity-0 transition-[transform,opacity] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
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
              This year
            </div>
            <div className="mt-5 grid grid-cols-2 gap-y-8">
              <MetaTile
                label="Bookings YTD"
                value={bookingsYtdCount}
                sub="Across the year"
              />
              <MetaTile
                label="Net received"
                value={moneyTotals(earningsYtdNet)}
                sub="After commission"
              />
              <MetaTile
                label="Awaiting"
                value={moneyTotals(pendingPaymentNet)}
                sub="Payments in flight"
              />
              <MetaTile
                label="Next booking"
                value={nextBooking ? dateShort(nextBooking.booking_date) : "—"}
                sub={nextBooking ? nextBooking.project_title : "None scheduled"}
              />
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

            <ul className="stagger-in space-y-2">
              {latestComms.map((c) => (
                <li key={c.id}>
                  <Link
                    href="/talent/communications"
                    className="group block rounded-xl border border-border bg-card p-4 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:border-border-strong hover:shadow-[var(--shadow-lift)]"
                  >
                    <div className="flex items-start gap-3">
                      {!c.isRead && (
                        <span
                          aria-hidden
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-bronze"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-[13px] font-medium text-foreground">
                            {c.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {relativeTime(c.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-[12px] text-muted-foreground">
                          {c.body}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
                            {statusLabel(c.type)}
                          </span>
                          {c.requiresResponse && c.responseStatus === "pending" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-warning">
                              <Clock className="h-2.5 w-2.5" /> Awaiting you
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {latestComms.length === 0 && (
                <li className="rounded-xl border border-dashed border-border bg-surface-muted/40 p-5 text-center text-[12px] text-muted-foreground">
                  No messages yet — Candor will reach out here.
                </li>
              )}
            </ul>
          </div>

          <div className="mt-12">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              Portfolio
            </div>
            <div className="mt-4 space-y-3">
              <PortfolioLine
                ok={me?.comp_card_status === "current"}
                label={`Comp card ${statusLabel(me?.comp_card_status || "missing").toLowerCase()}`}
              />
              <PortfolioLine
                ok={me?.digitals_status === "current"}
                label={`Digitals ${statusLabel(me?.digitals_status || "missing").toLowerCase()}`}
              />
              {me?.next_scheduled_shoot && (
                <PortfolioLine
                  ok={false}
                  label={`Next test shoot — ${dateShort(me.next_scheduled_shoot)}`}
                />
              )}
            </div>
            <Link
              href="/talent/portfolio"
              className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View portfolio
              <ArrowUpRight className="h-3 w-3" />
            </Link>
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
                From the <span className="editorial-italic">community</span>
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
              Updated by Candor
            </span>
          </div>
          <ul className="stagger-in grid grid-cols-1 gap-x-8 gap-y-8 pt-8 md:grid-cols-3">
            {wire.map((p) => {
              const Icon = p.kind === "milestone" ? Sparkles : Megaphone;
              const tone = p.kind === "milestone" ? "text-success" : "text-bronze";
              return (
                <li key={p.id}>
                  <Link href={p.href} className="group block">
                    <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]">
                      <Icon className={`h-3 w-3 ${tone}`} />
                      <span className={tone}>
                        {p.kind === "milestone" ? "Milestone" : "Casting"}
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif text-[19px] font-light leading-snug text-foreground transition-colors group-hover:text-foreground/80">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                      {p.sub}
                    </p>
                  </Link>
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

function PortfolioLine({ ok, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rule-between flex-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span
            className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-success" : "bg-warning"}`}
          />
          {label}
        </div>
      </div>
    </div>
  );
}
