"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, X, Sparkle, PaperPlaneTilt } from "@phosphor-icons/react";
import { initials } from "./roster";
import { dayLabel } from "./bookings-data";
// The community accent: petrol is your business, amber is urgent, green is the roster.
export const GREEN = "oklch(0.41 0.072 168)";

/*
  COMMUNITY — the two pages where the roster is the point.

  Casting board: opportunity. Briefs stay anonymous until you are shortlisted,
  so the cards name a kind of house, not a house. The one real decision is
  "put me forward", so that is the one that mutates state.

  Milestones: celebration. Wins across the roster, your name only if you opt
  in. Cheering is the small social act; sharing a win is the larger one, and
  it goes to Candor for review rather than straight to the wall.
*/

const CASTINGS = [
  {
    id: "parishouse",
    house: "A Paris house",
    kind: "Campaign",
    length: "2 days",
    city: "Paris",
    when: "8–9 April",
    rate: "€4,000–6,000 / day",
    brief: "New faces, 176–181 cm. Natural hair, no extensions.",
    closes: "Closes Friday",
    status: "shortlisted",
    note: "The brief opens to you on Monday.",
  },
  {
    id: "scandi",
    house: "A Scandinavian label",
    kind: "E-comm",
    length: "1 day",
    city: "Copenhagen",
    when: "14 April",
    rate: "$1,800–2,200",
    brief: "Size 6–8, clean skin. Flights covered.",
    closes: "Closes in 3 days",
    status: "in",
  },
  {
    id: "beauty",
    house: "A beauty house",
    kind: "Beauty",
    length: "1 day",
    city: "London",
    when: "3 April",
    rate: "$4,500",
    brief: "Clean skin, no lash extensions. Close-up work.",
    closes: "Closes tomorrow",
    status: "open",
    soon: true,
  },
  {
    id: "heritage",
    house: "A British heritage brand",
    kind: "Runway",
    length: "Show",
    city: "London",
    when: "22 April",
    rate: "$6,000",
    brief: "Walk required. The casting director attends in person.",
    closes: "Closes 2 April",
    status: "open",
  },
  {
    id: "italian",
    house: "An Italian house",
    kind: "Lookbook",
    length: "1 day",
    city: "Milan",
    when: "17 April",
    rate: "$3,200",
    brief: "Flat shoes, minimal tan lines. Outdoors.",
    closes: "Closes 9 April",
    status: "open",
  },
  {
    id: "indie",
    house: "An independent magazine",
    kind: "Editorial",
    length: "1 day",
    city: "Berlin",
    when: "28 April",
    rate: "Expenses only",
    brief: "Tear sheets in exchange. Strong pages for a new book.",
    closes: "Closes 15 April",
    status: "open",
  },
  {
    id: "sportswear",
    house: "A sportswear brand",
    kind: "Campaign",
    length: "3 days",
    city: "Lisbon",
    when: "5–7 May",
    rate: "$3,000 / day",
    brief: "Athletic build. Movement on set.",
    closes: "Filled",
    status: "filled",
  },
];

const WINS = [
  { id: "freya", who: "Freya Lindqvist", what: "First cover", detail: "Vogue Scandinavia · April issue", when: "2d", cheers: 14 },
  { id: "anais", who: "Anaïs Dubois", what: "Shortlisted for Loewe", detail: "FW26 campaign · Paris", when: "3d", cheers: 9 },
  { id: "zara", who: "Zara Achebe", you: true, what: "Biggest booking yet", detail: "Acne Studios FW26 · Paris", when: "1w", cheers: 21 },
  { id: "chidera", who: "Chidera Okafor", what: "Walked her first show", detail: "Prada FW26 · Milan", when: "1w", cheers: 18 },
  { id: "hana", who: "Hana Takahashi", what: "Signed in Paris", detail: "Elite Paris · Candor stays mother agency", when: "2w", cheers: 12 },
  { id: "ebun", who: "Ebun Salami", what: "First international campaign", detail: "Ganni · Copenhagen", when: "3w", cheers: 11 },
  { id: "rosa", who: "Rosa Delgado", what: "Tear sheets landed", detail: "Vogue España · eight pages", when: "3w", cheers: 7 },
  { id: "lara", who: "Lara Okonjo", what: "Direct booking", detail: "Burberry · outerwear campaign", when: "1mo", cheers: 6 },
];

function DrawnCheck({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2 6.4 L4.9 9.3 L10 3.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="draw-in"
      />
    </svg>
  );
}

// The soonest-closing brief gets a real clock. The deadline is fixed at mount
// so the demo counts down from the same place every time, and nothing renders
// on the server that the client would then disagree with.
const SOONEST_CLOSES_IN = 22 * 3600 + 14 * 60 + 7;

function useCountdown(seconds) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const end = Date.now() + seconds * 1000;
    const tick = () => setLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [seconds]);
  if (left == null) return null;
  const h = String(Math.floor(left / 3600)).padStart(2, "0");
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/*
  MASTHEAD — the community pages get the accent, full bleed.

  The animation is a studio light crossing the band. There is nothing to
  decode: light moving over a surface is what a studio looks like, so it reads
  as atmosphere rather than as a diagram of anything. Two soft shafts drift
  behind it on their own clocks so the band never repeats exactly. 19 seconds
  end to end — slow enough that you feel it rather than watch it, and it stops
  entirely under prefers-reduced-motion.
*/
function Masthead({ title, meta, statValue, statLabel, radius }) {
  return (
    <section
      style={{ borderRadius: radius, background: GREEN }}
      className="relative shrink-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1000 132"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="cm-key" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.20" />
            <stop offset="45%" stopColor="#fff" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cm-shaft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Two light shafts, as if through a scrim */}
        <g style={{ "--shaft-dur": "13s" }} className="shaft-drift">
          <rect x="150" y="-40" width="26" height="220" fill="url(#cm-shaft)" transform="rotate(14 163 66)" />
        </g>
        <g style={{ "--shaft-dur": "17s", "--shaft-delay": "-6s" }} className="shaft-drift">
          <rect x="640" y="-40" width="44" height="220" fill="url(#cm-shaft)" transform="rotate(14 662 66)" />
        </g>

        {/* The key light, crossing */}
        <g className="light-sweep">
          <ellipse cx="500" cy="52" rx="330" ry="150" fill="url(#cm-key)" />
        </g>
      </svg>

      <div className="relative flex items-end gap-4 px-5 py-5">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.09em] text-white/55 uppercase">Community</p>
          <h2
            style={{ fontFamily: "'Arno Pro', Georgia, serif" }}
            className="mt-1.5 text-[26px] leading-none font-bold tracking-[0.01em] text-white"
          >
            {title}
          </h2>
          <p className="mt-1.5 text-[11.5px] text-white/65">{meta}</p>
        </div>

        <div className="ml-auto shrink-0 border-l border-white/20 pl-4 text-right">
          <p className="font-mono text-[30px] leading-none font-semibold tracking-[-0.03em] tabular-nums text-white">
            {statValue}
          </p>
          <p className="mt-1.5 text-[10.5px] text-white/60">{statLabel}</p>
        </div>
      </div>
    </section>
  );
}

const green = { background: GREEN };
const greenText = { color: GREEN };

function Tile({ radius, className = "", children }) {
  return (
    <section
      style={{ borderRadius: radius }}
      className={`border border-border bg-surface shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </section>
  );
}

/* ---------- Casting board ---------- */

function CastingBoard({ radius }) {
  const [castings, setCastings] = useState(CASTINGS);
  const flip = (id, status) =>
    setCastings((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  const countdown = useCountdown(SOONEST_CLOSES_IN);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {castings.map((c) => {
        const shortlisted = c.status === "shortlisted";
        const filled = c.status === "filled";
        return (
          <Tile
            key={c.id}
            radius={radius}
            className={`flex flex-col p-4 transition-opacity ${filled ? "opacity-55" : ""}`}
          >
            <div className="flex items-start gap-2">
              <p
                style={{ fontFamily: "'Arno Pro', Georgia, serif" }}
                className="text-[16px] leading-tight font-bold tracking-[0.01em] text-foreground italic"
              >
                {c.house}
              </p>
              {shortlisted ? (
                <span
                  style={green}
                  className="ml-auto flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.07em] text-white uppercase"
                >
                  <span className="pop-once">
                    <Sparkle size={9} weight="fill" />
                  </span>
                  Shortlisted
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {c.kind} · {c.length} · {c.city} · {c.when}
            </p>

            <p className="mt-3 font-mono text-[13px] font-semibold tracking-[-0.01em] tabular-nums text-foreground">
              {c.rate}
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-foreground/90">{c.brief}</p>
            {shortlisted && c.note ? (
              <p style={greenText} className="mt-2 text-[11px] font-medium">
                {c.note}
              </p>
            ) : null}

            <div className="mt-auto flex items-center gap-2 border-t border-border/60 pt-3">
              {c.soon && c.status !== "filled" && countdown ? (
                <span className="flex items-baseline gap-1.5 text-[10.5px] text-muted-foreground">
                  closes in
                  <span style={greenText} className="font-mono text-[12px] font-semibold tabular-nums">
                    {countdown}
                  </span>
                </span>
              ) : (
                <span className="text-[10.5px] text-muted-foreground">{c.closes}</span>
              )}
              <div className="ml-auto flex items-center gap-1.5">
                {c.status === "open" ? (
                  <button
                    type="button"
                    onClick={() => flip(c.id, "in")}
                    style={green}
                    className="pressable flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold text-white transition-[filter,transform] duration-140 ease-[var(--ease-out)] hover:brightness-110"
                  >
                    Put me forward
                    <ArrowRight size={11} weight="bold" />
                  </button>
                ) : c.status === "in" ? (
                  <>
                    <span
                      style={{ color: GREEN, borderColor: GREEN }}
                      className="tick-in flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold"
                    >
                      <DrawnCheck />
                      You&apos;re in
                    </span>
                    <button
                      type="button"
                      onClick={() => flip(c.id, "open")}
                      aria-label="Withdraw"
                      className="pressable grid h-7 w-7 place-items-center rounded-lg text-muted-foreground/60 transition-colors duration-140 hover:bg-surface-muted hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : shortlisted ? (
                  <span className="text-[11px] font-medium text-foreground">Awaiting the brief</span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">Filled</span>
                )}
              </div>
            </div>
          </Tile>
        );
      })}
    </div>
  );
}

/* ---------- Milestones ---------- */

function Milestones({ bookings, radius }) {
  const [wins, setWins] = useState(WINS);
  const [cheered, setCheered] = useState(() => new Set());
  const [pick, setPick] = useState("");
  const [line, setLine] = useState("");
  const [sent, setSent] = useState([]);

  const completed = bookings.filter((b) => b.status === "completed");

  function cheer(id) {
    const on = cheered.has(id);
    setCheered((prev) => {
      const next = new Set(prev);
      on ? next.delete(id) : next.add(id);
      return next;
    });
    setWins((prev) => prev.map((w) => (w.id === id ? { ...w, cheers: w.cheers + (on ? -1 : 1) } : w)));
  }

  function share() {
    const b = completed.find((x) => x.id === pick);
    if (!b) return;
    setSent((prev) => [{ id: `${b.id}-${prev.length}`, booking: b, line }, ...prev]);
    setPick("");
    setLine("");
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      {/* The wall */}
      <Tile radius={radius} className="flex flex-col overflow-hidden">
        {/* The count lives in the masthead now — this row just names the list. */}
        <div className="flex items-baseline gap-2 border-b border-border/60 px-4 py-2.5">
          <h3 className="text-[12px] font-semibold text-foreground">The wall</h3>
          <p className="text-[10.5px] text-muted-foreground">across 41 on the roster</p>
        </div>
        <ul className="stagger-in divide-y divide-border/50">
          {wins.map((w) => {
            const on = cheered.has(w.id);
            return (
              <li key={w.id} className="flex items-start gap-3 px-4 py-3">
                <span
                  style={w.you ? green : undefined}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[9.5px] font-semibold ${
                    w.you ? "text-white" : "bg-surface-muted text-foreground"
                  }`}
                >
                  {initials(w.who)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] leading-snug text-foreground">
                    <span className="font-semibold">{w.you ? "You" : w.who.split(" ")[0]}</span>
                    <span className="text-muted-foreground"> · </span>
                    {w.what}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{w.detail}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-mono text-[9.5px] tabular-nums text-muted-foreground/70">{w.when}</span>
                  <button
                    type="button"
                    onClick={() => cheer(w.id)}
                    style={on ? { color: GREEN, borderColor: GREEN } : undefined}
                    className={`pressable flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-colors duration-140 ease-[var(--ease-out)] ${
                      on ? "" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span key={String(on)} className={on ? "pop-once" : "inline-flex"}>
                      <Sparkle size={10} weight={on ? "fill" : "regular"} />
                    </span>
                    <span key={w.cheers} className="tick-in font-mono tabular-nums">
                      {w.cheers}
                    </span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Tile>

      {/* Share a win */}
      <div className="flex flex-col gap-3">
        <Tile radius={radius} className="p-4">
          <p className="text-[12px] font-semibold text-foreground">Share a win</p>
          <p className="mt-0.5 text-[10.5px] text-muted-foreground">
            Reviewed by Candor before it goes on the wall. Your name only if you opt in.
          </p>

          <p className="mt-3.5 text-[10px] tracking-[0.04em] text-muted-foreground uppercase">From a completed booking</p>
          <ul className="mt-1.5 space-y-1">
            {completed.map((b) => {
              const on = pick === b.id;
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => setPick(on ? "" : b.id)}
                    style={on ? { borderColor: GREEN } : undefined}
                    className={`pressable flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors duration-140 ease-[var(--ease-out)] ${
                      on ? "bg-surface" : "border-border/70 hover:bg-surface-muted/60"
                    }`}
                  >
                    <span className="w-[42px] shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                      {dayLabel(b.on)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11.5px] text-foreground">
                      <span className="font-medium">{b.client}</span>
                      <span className="text-muted-foreground"> · {b.kind}</span>
                    </span>
                    {on ? <Check size={12} weight="bold" style={greenText} /> : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <input
            value={line}
            onChange={(e) => setLine(e.target.value)}
            placeholder="One line, in your words"
            className="mt-3 w-full rounded-lg border border-border/70 bg-surface px-2.5 py-2 text-[11.5px] text-foreground outline-none transition-colors duration-140 placeholder:text-muted-foreground/60 focus:border-border-strong"
          />

          <button
            type="button"
            disabled={!pick}
            onClick={share}
            style={pick ? green : undefined}
            className={`pressable mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[11.5px] font-semibold transition-[filter,transform] duration-140 ease-[var(--ease-out)] ${
              pick ? "text-white hover:brightness-110" : "bg-surface-muted text-muted-foreground"
            }`}
          >
            <PaperPlaneTilt size={12} weight="fill" />
            Send to Candor
          </button>
        </Tile>

        {sent.length > 0 ? (
          <Tile radius={radius} className="p-4">
            <p className="text-[10px] tracking-[0.04em] text-muted-foreground uppercase">Your submissions</p>
            <ul className="mt-2 space-y-2">
              {sent.map((s) => (
                <li key={s.id} className="slide-up-in flex items-start gap-2.5">
                  <span style={green} className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-medium text-foreground">
                      {s.booking.client} · {s.booking.kind}
                    </p>
                    {s.line ? <p className="text-[11px] text-muted-foreground">“{s.line}”</p> : null}
                    <p style={greenText} className="mt-0.5 text-[10.5px] font-medium">
                      With Candor — reviewed within a day
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Tile>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- The page ---------- */

export function CommunityView({ tab, bookings, cardGap, innerRadius }) {
  const gapStyle =
    cardGap != null ? (typeof cardGap === "number" ? `${cardGap}px` : cardGap) : "var(--card-gap, 16px)";
  const radius =
    innerRadius != null
      ? typeof innerRadius === "number"
        ? `${innerRadius}px`
        : innerRadius
      : "var(--inner-radius, 16px)";

  const castings = tab === "castings";

  return (
    <div style={{ padding: gapStyle }} className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto">
      <Masthead
        radius={radius}
        title={castings ? "Casting board" : "Milestones"}
        meta={
          castings
            ? "Briefs stay anonymous until you're shortlisted"
            : "Your name appears only if you opt in"
        }
        statValue={castings ? "7" : "11"}
        statLabel={castings ? "open right now" : "wins this month"}
      />

      {castings ? <CastingBoard radius={radius} /> : <Milestones bookings={bookings} radius={radius} />}
    </div>
  );
}
