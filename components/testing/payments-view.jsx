"use client";

import { useRef, useState } from "react";
import { ArrowRight, CaretRight, FileText, Bank } from "@phosphor-icons/react";

/*
  PAYMENTS — a ledger, not a dashboard. No chart: the money is the picture.

  The hierarchy is the one a model actually thinks in — net first, because that
  is what lands in the account, with the gross and the agency's cut kept as the
  quiet second line. Monospace tabular figures mean every column of numbers
  lines up on the decimal, which is most of why a good ledger looks good.
*/

const COMMISSION = 0.2;

const usd = (n) => `$${Math.round(n).toLocaleString("en-US")}`;
const net = (gross) => gross * (1 - COMMISSION);

const PAY_STATUS = {
  cleared: { label: "Cleared", tone: "quiet" },
  processing: { label: "Processing", tone: "brand" },
  invoiced: { label: "Invoiced", tone: "quiet" },
  pending: { label: "Not invoiced", tone: "quiet" },
  overdue: { label: "Past terms", tone: "urgent" },
};

const PAYMENTS = [
  {
    id: "tilbury",
    month: "March",
    date: "Mar 19",
    client: "Charlotte Tilbury",
    what: "Beauty — complexion launch",
    city: "London",
    gross: 5400,
    status: "pending",
    invoice: "—",
    issued: "—",
    terms: "Client PO outstanding",
    usage: "Digital + in-store · 18 months · worldwide",
  },
  {
    id: "acne",
    month: "March",
    date: "Mar 12",
    client: "Acne Studios",
    what: "FW26 campaign",
    city: "Paris",
    gross: 12000,
    status: "invoiced",
    invoice: "CA-0429",
    issued: "13 March",
    terms: "Due 13 April · 30 day terms",
    usage: "Digital + OOH · 12 months · EU",
  },
  {
    id: "bottega",
    month: "March",
    date: "Mar 10",
    client: "Bottega Veneta",
    what: "FW26 fitting",
    city: "London",
    gross: 3200,
    status: "processing",
    invoice: "CA-0427",
    issued: "10 March",
    terms: "Sent 12 March · 2–3 working days",
    usage: "Fitting only — no usage",
  },
  {
    id: "zaralook",
    month: "March",
    date: "Mar 4",
    client: "Zara",
    what: "SS26 lookbook",
    city: "London",
    gross: 2400,
    status: "cleared",
    invoice: "CA-0421",
    issued: "1 March",
    terms: "Cleared 4 March",
    usage: "Lookbook · 12 months · worldwide",
  },
  {
    id: "voguebeauty",
    month: "March",
    date: "Mar 2",
    client: "Vogue Scandinavia",
    what: "Beauty story, six pages",
    city: "Copenhagen",
    gross: 8400,
    status: "cleared",
    invoice: "CA-0418",
    issued: "20 February",
    terms: "Cleared 2 March",
    usage: "Print + digital · 6 months · Nordics",
  },
  {
    id: "selfridges",
    month: "February",
    date: "Feb 14",
    client: "Selfridges",
    what: "E-comm fittings",
    city: "London",
    gross: 1600,
    status: "cleared",
    invoice: "CA-0414",
    issued: "14 February",
    terms: "Cleared 28 February",
    usage: "E-comm · 24 months · worldwide",
  },
  {
    id: "ganni",
    month: "February",
    date: "Feb 12",
    client: "Ganni",
    what: "Campaign — denim capsule",
    city: "Copenhagen",
    gross: 5600,
    status: "overdue",
    invoice: "CA-0412",
    issued: "12 February",
    terms: "Due 14 March · 9 days past terms",
    usage: "Digital + OOH · 12 months · EU",
  },
  {
    id: "toteme",
    month: "February",
    date: "Feb 8",
    client: "Totême",
    what: "Cancellation fee — knitwear drop",
    city: "Stockholm",
    gross: 900,
    status: "cleared",
    invoice: "CA-0409",
    issued: "8 February",
    terms: "Cleared 11 March",
    usage: "50% of day rate · no usage",
  },
  {
    id: "hm",
    month: "February",
    date: "Feb 6",
    client: "H&M Studio",
    what: "Campaign — spring drop",
    city: "Stockholm",
    gross: 9500,
    status: "cleared",
    invoice: "CA-0404",
    issued: "6 February",
    terms: "Cleared 20 February",
    usage: "Digital + OOH · 12 months · worldwide",
  },
  {
    id: "arket",
    month: "January",
    date: "Jan 28",
    client: "Arket",
    what: "E-comm — knitwear",
    city: "Stockholm",
    gross: 2100,
    status: "cleared",
    invoice: "CA-0396",
    issued: "28 January",
    terms: "Cleared 11 February",
    usage: "E-comm · 24 months · worldwide",
  },
  {
    id: "stories",
    month: "January",
    date: "Jan 19",
    client: "& Other Stories",
    what: "Lookbook — resort",
    city: "Copenhagen",
    gross: 3000,
    status: "cleared",
    invoice: "CA-0391",
    issued: "19 January",
    terms: "Cleared 2 February",
    usage: "Lookbook · 12 months · EU",
  },
];

const IN_FLIGHT = ["pending", "invoiced", "processing"];

function Figure({ label, value, sub, tone = "default", size = "sm", onClick }) {
  const urgent = tone === "urgent";
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      /* A <button> centres its content in its own box, so in a stretched grid
         cell it drifts off the baseline its neighbours share. Making the button
         itself a flex column pins the content back to the top. */
      className={`flex w-full min-w-0 flex-col items-start justify-start px-5 py-4 text-left ${
        onClick
          ? "pressable transition-colors duration-140 ease-[var(--ease-out)] hover:bg-surface-muted/50"
          : ""
      }`}
    >
      <p className="text-[10px] tracking-[0.06em] text-muted-foreground uppercase">{label}</p>
      <p
        style={urgent ? { color: "var(--urgent)" } : undefined}
        className={`mt-2 font-mono font-semibold tracking-[-0.03em] tabular-nums ${
          urgent ? "" : "text-foreground"
        } ${size === "lg" ? "text-[42px] leading-[0.9]" : "text-[26px] leading-[0.95]"}`}
      >
        {value}
      </p>
      <p className="mt-2 truncate text-[11px] text-muted-foreground">{sub}</p>
    </Tag>
  );
}

function Line({ label, value, strong = false }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[3px]">
      <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <span className="h-px min-w-4 flex-1 translate-y-[-3px] bg-border/70" />
      <span
        className={`shrink-0 font-mono tabular-nums ${
          strong ? "text-[12.5px] font-semibold text-foreground" : "text-[11.5px] text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function PaymentsView({ onGoTo, cardGap, innerRadius }) {
  const gapStyle =
    cardGap != null ? (typeof cardGap === "number" ? `${cardGap}px` : cardGap) : "var(--card-gap, 16px)";
  const radius =
    innerRadius != null
      ? typeof innerRadius === "number"
        ? `${innerRadius}px`
        : innerRadius
      : "var(--inner-radius, 16px)";

  const [openId, setOpenId] = useState(null);
  const rowRefs = useRef({});

  const sum = (list) => list.reduce((total, p) => total + p.gross, 0);
  const clearedRows = PAYMENTS.filter((p) => p.status === "cleared");
  const flightRows = PAYMENTS.filter((p) => IN_FLIGHT.includes(p.status));
  const overdueRows = PAYMENTS.filter((p) => p.status === "overdue");

  const clearedGross = sum(clearedRows);
  const overdue = overdueRows[0] ?? null;

  // Preserve the order the data is written in; months are already newest first.
  const months = [];
  for (const p of PAYMENTS) {
    const last = months[months.length - 1];
    if (last && last.name === p.month) last.rows.push(p);
    else months.push({ name: p.month, rows: [p] });
  }

  function reveal(id) {
    setOpenId(id);
    // Wait a frame: scrolling in the same tick measures the row before it has
    // expanded, which leaves the breakdown hanging off the bottom.
    requestAnimationFrame(() =>
      rowRefs.current[id]?.scrollIntoView({ block: "center", behavior: "smooth" })
    );
  }

  return (
    <div style={{ padding: gapStyle }} className="flex h-full min-h-0 flex-col gap-3">
      {/* The three numbers, divided by hairlines rather than boxed separately */}
      <section
        style={{ borderRadius: radius }}
        className="grid shrink-0 divide-y divide-border/60 border border-border bg-surface shadow-[var(--shadow-soft)] sm:grid-cols-[1.5fr_1fr_1fr] sm:divide-x sm:divide-y-0"
      >
        <Figure
          size="lg"
          label="Cleared to your account"
          value={usd(net(clearedGross))}
          sub={`${usd(clearedGross)} booked · ${usd(clearedGross * COMMISSION)} agency commission`}
        />
        <Figure
          label="In flight"
          value={usd(net(sum(flightRows)))}
          sub={`${flightRows.length} payments · Bottega lands in 2–3 days`}
        />
        <Figure
          tone="urgent"
          label="Past terms"
          value={usd(net(sum(overdueRows)))}
          sub={overdue ? `${overdue.client} · 9 days over` : "Nothing overdue"}
          onClick={overdue ? () => reveal(overdue.id) : undefined}
        />
      </section>

      {/* The ledger */}
      <section
        style={{ borderRadius: radius }}
        className="flex min-h-0 flex-1 flex-col overflow-hidden border border-border bg-surface shadow-[var(--shadow-soft)]"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          {months.map((month) => (
            <div key={month.name}>
              <div className="sticky top-0 z-10 flex items-baseline gap-2 border-b border-border/60 bg-surface/95 px-5 py-2 backdrop-blur-sm">
                <h3 className="editorial-italic text-[15px] text-foreground">{month.name}</h3>
                <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
                  {usd(net(sum(month.rows)))}
                </span>
              </div>

              <ul className="divide-y divide-border/40">
                {month.rows.map((p) => {
                  const meta = PAY_STATUS[p.status];
                  const open = openId === p.id;
                  return (
                    <li
                      key={p.id}
                      ref={(el) => {
                        rowRefs.current[p.id] = el;
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : p.id)}
                        className="hover-reveal flex w-full items-center gap-4 px-5 py-3 text-left outline-none focus-visible:bg-surface-muted"
                      >
                        <span className="w-[46px] shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                          {p.date}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-foreground">
                            {p.client}
                          </span>
                          <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">
                            {p.what} · {p.city}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block font-mono text-[15px] leading-none font-semibold tracking-[-0.02em] tabular-nums text-foreground">
                            {usd(net(p.gross))}
                          </span>
                          <span
                            style={meta.tone === "urgent" ? { color: "var(--urgent)" } : undefined}
                            className={`mt-1.5 block text-[10px] ${
                              meta.tone === "urgent"
                                ? "font-semibold"
                                : meta.tone === "brand"
                                  ? "font-medium text-brand"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {meta.label}
                          </span>
                        </span>
                        <CaretRight
                          size={12}
                          className={`shrink-0 text-muted-foreground/45 transition-transform duration-180 ease-[var(--ease-out)] ${
                            open ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {open ? (
                        <div className="slide-up-in px-5 pb-4">
                          <div className="rounded-xl border border-border/70 bg-surface-muted/40 p-3.5">
                            <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                              <div>
                                <Line label="Day rate" value={usd(p.gross)} />
                                <Line
                                  label={`Agency commission (${COMMISSION * 100}%)`}
                                  value={`− ${usd(p.gross * COMMISSION)}`}
                                />
                                <div className="mt-1 border-t border-border/70 pt-1">
                                  <Line label="Net to you" value={usd(net(p.gross))} strong />
                                </div>
                              </div>
                              <div className="mt-2 space-y-1 sm:mt-0">
                                <Line label="Invoice" value={p.invoice} />
                                <Line label="Issued" value={p.issued} />
                                <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
                                  {p.terms}
                                </p>
                                <p className="text-[11px] leading-relaxed text-muted-foreground">
                                  {p.usage}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3">
                              {p.status === "overdue" ? (
                                <button
                                  type="button"
                                  onClick={() => onGoTo?.("messages")}
                                  className="pressable flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-[11.5px] font-semibold text-brand-foreground transition-[filter,transform] duration-140 ease-[var(--ease-out)] hover:brightness-110"
                                >
                                  Chase payment
                                  <ArrowRight size={12} weight="bold" />
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => onGoTo?.("documents")}
                                className="pressable flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors duration-140 ease-[var(--ease-out)] hover:bg-surface-muted hover:text-foreground"
                              >
                                <FileText size={12} />
                                View invoice
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Where it lands */}
        <footer className="flex shrink-0 items-center gap-2 border-t border-border/60 bg-surface/80 px-5 py-3 backdrop-blur-xs">
          <Bank size={14} className="shrink-0 text-muted-foreground" />
          <p className="min-w-0 truncate text-[11.5px] text-muted-foreground">
            Paid into <span className="font-medium text-foreground">Monzo</span> · GBP ····4417
          </p>
          <button
            type="button"
            onClick={() => onGoTo?.("documents")}
            className="pressable ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors duration-140 ease-[var(--ease-out)] hover:bg-surface-muted hover:text-foreground"
          >
            <FileText size={12} />
            Statement
          </button>
        </footer>
      </section>
    </div>
  );
}
