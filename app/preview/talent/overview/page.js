import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, Megaphone, Sparkles } from "lucide-react";
import { preview } from "@/lib/preview/mock";
import { gradientFor } from "@/lib/gradients";
import { dateShort, money, relativeTime, statusLabel } from "@/lib/format";
import { moneyTotals } from "@/components/talent/money-totals";
import { bookingTone } from "@/components/talent/status-tones";
import { TalentFrame } from "@/components/preview/talent-frame";

function StatTile({ label, value, sub }) {
  return (
    <div>
      <div className="text-[12px] font-medium text-muted-foreground">{label}</div>
      <div data-slot="numeric" className="mt-1.5 text-[20px] font-medium tracking-[-0.01em] text-foreground">{value}</div>
      {sub && <div className="mt-1 text-[12px] text-muted-foreground/80">{sub}</div>}
    </div>
  );
}

function SectionHead({ title, href, linkLabel }) {
  return (
    <div className="flex items-baseline justify-between pb-3">
      <h2 className="text-[13px] font-medium text-foreground">{title}</h2>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1 text-[12px] font-medium text-brand transition-colors hover:text-brand-hover">
          {linkLabel}
          <ArrowRight className="h-3 w-3 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function PortfolioLine({ ok, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px]">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-success" : "bg-warning"}`} />
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function Page() {
  const me = preview.me;
  const { bookingsYtdCount, earningsYtdNet, pendingPaymentNet, nextBooking, upcomingBookings, latestComms, community } = preview.overview;
  const name = me.first_name;
  const heroGradient = gradientFor(me.id);
  const rest = upcomingBookings.filter((b) => b.id !== nextBooking?.id);
  const nextTone = nextBooking ? bookingTone(nextBooking.status) : null;
  const wire = [
    ...community.milestones.map((m) => ({ kind: "milestone", id: `m-${m.id}`, title: m.display_text, sub: relativeTime(m.created_at), href: "/preview/talent/milestones" })),
    ...community.castings.map((c) => ({ kind: "casting", id: `c-${c.id}`, title: c.title, sub: `${statusLabel(c.location)} · closes ${relativeTime(c.deadline)}`, href: "/preview/talent/castings" })),
  ].slice(0, 3);

  return (
    <TalentFrame>
      <div className="pb-8 pt-2">
        <h1 className="text-[32px] font-light leading-[1.1] tracking-[-0.02em] text-foreground">
          Morning, <span className="editorial-italic">{name}</span>.
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-6 border-y border-border py-5 md:grid-cols-4">
        <StatTile label="Bookings this year" value={bookingsYtdCount} />
        <StatTile label="Net received" value={moneyTotals(earningsYtdNet)} />
        <StatTile label="In flight" value={moneyTotals(pendingPaymentNet)} />
        <StatTile label="Next booking" value={nextBooking ? dateShort(nextBooking.booking_date) : "—"} sub={nextBooking ? nextBooking.project_title : "None scheduled"} />
      </div>

      <div className="mt-10 grid grid-cols-12 gap-x-10 gap-y-10">
        <div className="col-span-12 lg:col-span-7">
          <SectionHead title="Next up" href="/preview/talent/bookings" linkLabel="All bookings" />
          {nextBooking && (
            <div className="card-hover group block overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-[16/7] overflow-hidden" style={{ background: heroGradient }}>
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-6 p-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-md">
                      <span className={`h-1.5 w-1.5 rounded-full ${nextTone.dot}`} />
                      {statusLabel(nextBooking.status)}
                    </div>
                    <h3 className="mt-2.5 text-[24px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">{nextBooking.project_title}</h3>
                    <div className="mt-1 inline-flex items-center gap-1 text-[12.5px] text-foreground/75">
                      <MapPin className="h-3 w-3" />
                      {statusLabel(nextBooking.location_city)}
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-foreground/50" />
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                {[["Date", dateShort(nextBooking.booking_date)], ["Fee", money(nextBooking.talent_fee, nextBooking.fee_currency)], ["Usage", nextBooking.media_usage || "—"]].map(([label, value]) => (
                  <div key={label} className="px-5 py-3.5">
                    <div className="text-[11.5px] text-muted-foreground">{label}</div>
                    <div data-slot="numeric" className="mt-0.5 truncate text-[13px] font-medium text-foreground">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div className="mt-8">
              <SectionHead title="Also coming up" />
              <ul className="divide-y divide-border border-y border-border">
                {rest.map((b) => {
                  const tone = bookingTone(b.status);
                  const dt = new Date(b.booking_date);
                  return (
                    <li key={b.id}>
                      <div className="hover-reveal group flex items-center gap-4 rounded-md px-2 py-3.5">
                        <div className="w-11 shrink-0 text-center">
                          <div data-slot="numeric" className="text-[17px] font-medium leading-none text-foreground">{dt.getDate()}</div>
                          <div className="mt-1 text-[10.5px] font-medium uppercase text-muted-foreground/70">{dt.toLocaleString("en-GB", { month: "short" })}</div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13.5px] font-medium text-foreground">{b.project_title}</div>
                          <div className="mt-0.5 truncate text-[12px] text-muted-foreground">{statusLabel(b.location_city)}</div>
                        </div>
                        <div className="text-right">
                          <div data-slot="numeric" className="text-[12.5px] font-medium text-foreground">{money(b.talent_fee, b.fee_currency)}</div>
                          <div className={`mt-0.5 text-[11.5px] font-medium ${tone.text}`}>{statusLabel(b.status)}</div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="col-span-12 space-y-10 lg:col-span-5">
          <div>
            <SectionHead title="Messages" href="/preview/talent/communications" linkLabel="Open inbox" />
            <ul className="stagger-in divide-y divide-border rounded-xl border border-border bg-card">
              {latestComms.map((c) => (
                <li key={c.id}>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${c.isRead ? "bg-transparent" : "bg-brand"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className={`truncate text-[13px] ${c.isRead ? "font-normal text-foreground/85" : "font-medium text-foreground"}`}>{c.title}</span>
                        <span className="shrink-0 text-[11.5px] text-muted-foreground">{relativeTime(c.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">{c.body}</p>
                      {c.requiresResponse && c.responseStatus === "pending" && (
                        <span className="mt-1.5 inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">Reply needed</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHead title="Portfolio" href="/preview/talent/portfolio" linkLabel="View" />
            <div className="space-y-2.5 rounded-xl border border-border bg-card px-4 py-3.5">
              <PortfolioLine ok={me.comp_card_status === "current"} label="Comp card" value={statusLabel(me.comp_card_status)} />
              <PortfolioLine ok={me.digitals_status === "current"} label="Digitals" value={statusLabel(me.digitals_status)} />
              {me.next_scheduled_shoot && <PortfolioLine ok label="Next test shoot" value={dateShort(me.next_scheduled_shoot)} />}
            </div>
          </div>

          {wire.length > 0 && (
            <div>
              <SectionHead title="Community" />
              <ul className="space-y-1">
                {wire.map((p) => {
                  const Icon = p.kind === "milestone" ? Sparkles : Megaphone;
                  return (
                    <li key={p.id}>
                      <div className="hover-reveal group flex items-start gap-3 rounded-lg px-2 py-2.5">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
                          <Icon className="h-3 w-3" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground">{p.title}</div>
                          <div className="mt-0.5 text-[11.5px] text-muted-foreground">{p.sub}</div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </TalentFrame>
  );
}
