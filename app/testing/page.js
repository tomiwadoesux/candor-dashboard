"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  House,
  Briefcase,
  ChatCircleDots,
  Wallet,
  CalendarBlank,
  FilmSlate,
  Trophy,
  BellSimple,
  X,
  Check,
  ArrowRight,
} from "@phosphor-icons/react";
import {
  Camera,
  IdCard,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { CardFeed } from "@/components/testing/card-feed";
import { HomeOverview } from "@/components/testing/home-overview";
import { TalentHomeView } from "@/components/testing/talent-home-view";
import { BookingsView } from "@/components/testing/bookings-view";
import { PaymentsView } from "@/components/testing/payments-view";
import { CalendarView } from "@/components/testing/calendar-view";
import { CommunityView } from "@/components/testing/community-view";
import { BOOKINGS } from "@/components/testing/bookings-data";

// Pinned to Porcelain palette with Apple-grade neutral tones
const LIGHT = {
  colorScheme: "light",
  "--background": "oklch(0.982 0.002 240)",
  "--foreground": "oklch(0.215 0.015 245)",
  "--surface": "oklch(0.997 0.001 240)",
  "--surface-muted": "oklch(0.962 0.003 240)",
  "--muted-foreground": "oklch(0.5 0.014 245)",
  "--border": "oklch(0.913 0.005 240)",
  "--sidebar": "oklch(0.972 0.003 240)",
  "--brand": "oklch(0.5255 0.1079 232.55)",
  "--brand-foreground": "oklch(0.99 0.003 232)",
  /* Urgent — deep ochre amber. Warm enough to read as caution, dark and
     desaturated enough to sit beside petrol and green without shouting. */
  "--urgent": "oklch(0.52 0.105 62)",
  "--urgent-soft": "oklch(0.966 0.020 62)",
  "--urgent-line": "oklch(0.895 0.040 62)",
};

// --- New Smooth Apple / Solar Fluid Curved Dual-Tone Bell ---
function CoolDualToneBell({ size = 22, unread = true, active = false, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-200 ${className}`}
    >
      {/* Translucent bell body with smooth continuous flare */}
      <path
        d="M12 2.5C8.96243 2.5 6.5 4.96243 6.5 8V12.793C6.5 13.5886 6.18393 14.3518 5.62132 14.9144L4.85355 15.6822C4.31886 16.2169 4.69766 17.1354 5.45388 17.1354H18.5461C19.3023 17.1354 19.6811 16.2169 19.1464 15.6822L18.3787 14.9144C17.8161 14.3518 17.5 13.5886 17.5 12.793V8C17.5 4.96243 15.0376 2.5 12 2.5Z"
        fill="currentColor"
        fillOpacity={active ? 0.35 : 0.22}
      />
      {/* Crisp outer contours */}
      <path
        d="M12 2.5C8.96243 2.5 6.5 4.96243 6.5 8V12.793C6.5 13.5886 6.18393 14.3518 5.62132 14.9144L4.85355 15.6822C4.31886 16.2169 4.69766 17.1354 5.45388 17.1354H18.5461C19.3023 17.1354 19.6811 16.2169 19.1464 15.6822L18.3787 14.9144C17.8161 14.3518 17.5 13.5886 17.5 12.793V8C17.5 4.96243 15.0376 2.5 12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top hanger loop */}
      <path
        d="M10 2.5C10 1.67157 10.8954 1 12 1C13.1046 1 14 1.67157 14 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Clapper */}
      <path
        d="M9.75 17.5C10.05 19.2 10.9 20.25 12 20.25C13.1 20.25 13.95 19.2 14.25 17.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Unread indicator pip */}
      {unread && (
        <circle
          cx="17"
          cy="5.5"
          r="2.5"
          className="fill-brand"
        />
      )}
    </svg>
  );
}

function CoolDualToneProfile({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-200 ${className}`}
    >
      {/* Outer circular badge */}
      <circle
        cx="12"
        cy="12"
        r="9.5"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      {/* Dual-Tone Head (translucent wash) */}
      <circle
        cx="12"
        cy="9"
        r="3.25"
        fill="currentColor"
        fillOpacity="0.28"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      {/* Dual-Tone Shoulders (translucent wash + solid contour) */}
      <path
        d="M6.75 18.25C7.25 15.5 9.25 14.5 12 14.5C14.75 14.5 16.75 15.5 17.25 18.25"
        fill="currentColor"
        fillOpacity="0.24"
      />
      <path
        d="M6.75 18.25C7.25 15.5 9.25 14.5 12 14.5C14.75 14.5 16.75 15.5 17.25 18.25"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

const PRIMARY_NAV = [
  { id: "overview", label: "Home", Icon: House },
  { id: "bookings", label: "Bookings", Icon: Briefcase, badge: "2" },
  { id: "messages", label: "Messages", Icon: ChatCircleDots, badge: "3" },
  { id: "payments", label: "Payments", Icon: Wallet },
  { id: "calendar", label: "Calendar", Icon: CalendarBlank },
];

const COMMUNITY_NAV = [
  { id: "castings", label: "Casting board", Icon: FilmSlate },
  { id: "milestones", label: "Milestones", Icon: Trophy, badge: "New" },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "New Booking Request",
    desc: "Acne Studios FW26 Campaign in Paris",
    time: "10m ago",
    unread: true,
  },
  {
    id: 2,
    title: "Payment Processed",
    desc: "$8,400.00 cleared for Vogue Scandinavia",
    time: "2h ago",
    unread: true,
  },
  {
    id: 3,
    title: "Contract Signed",
    desc: "Bottega Veneta NDA finalized by MD",
    time: "Yesterday",
    unread: false,
  },
];

/* Greetings, not a news ticker. The big serif line speaks to Zara; the small
   line underneath carries the one concrete fact that matters right now.
   `when` buckets the line to a time of day — "any" lines are always eligible
   and are the only ones rendered on the server, so hydration stays stable. */
function timeBucket(hour) {
  if (hour >= 4 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

// Swap this and every greeting re-addresses the new talent.
const TALENT_FIRST_NAME = "Zara";
const withName = (line) => line.replace(/{name}/g, TALENT_FIRST_NAME);

const WELCOME_MESSAGES = [
  // Always eligible — the resting states
  { id: "welcomeback", when: "any", title: "Welcome back, {name}", sub: "new face model" },
  { id: "parisoption", when: "any", title: "You're on hold for Paris, {name}", sub: "saint laurent · second option" },
  { id: "ndasigned", when: "any", title: "Your NDA's signed, {name}", sub: "bottega veneta · exclusive" },

  // Dawn — 04:00 to 08:00. Cars, call times, the pre-light hours.
  { id: "earlycar", when: "dawn", title: "Early call, {name} — car's at 06:30", sub: "prada fw26 · 180 the strand" },
  { id: "beforecity", when: "dawn", title: "Up before the city, {name}", sub: "bottega fitting · 07:15 call" },
  { id: "coffeeshoreditch", when: "dawn", title: "Coffee then Shoreditch, {name}", sub: "lookbook day · studio 4" },

  // Morning — 08:00 to 12:00
  { id: "morning", when: "morning", title: "Morning, {name}", sub: "two fittings and a wire cleared" },
  { id: "onoption", when: "morning", title: "Good morning {name} — you're on option", sub: "paris fashion week · saint laurent" },
  { id: "clearmorning", when: "morning", title: "Clear morning, {name}", sub: "no calls until thursday" },
  { id: "briefinbox", when: "morning", title: "Your brief's in, {name}", sub: "acne studios fw26 campaign" },

  // Day — 12:00 to 17:00
  { id: "bigshoot", when: "day", title: "Big shoot day tomorrow, {name}", sub: "prada fw26 · call 07:15" },
  { id: "wrappedearly", when: "day", title: "Fitting wrapped early, {name}", sub: "you've got the afternoon back" },
  { id: "busyone", when: "day", title: "Busy one, {name}", sub: "three confirmations waiting" },
  { id: "loewereel", when: "day", title: "Loewe asked for your reel, {name}", sub: "casting director · send by 6pm" },
  { id: "halfway", when: "day", title: "Halfway through, {name}", sub: "lookbook wrapped at shoreditch" },

  // Evening — 17:00 to 21:00
  { id: "longday", when: "evening", title: "Long day, {name}", sub: "$3,200 day rate cleared" },
  { id: "wrapdinner", when: "evening", title: "Wrap dinner tonight, {name}", sub: "palais de tokyo · 20:00" },
  { id: "eurostar", when: "evening", title: "Evening, {name}", sub: "eurostar thursday 08:01" },
  { id: "copenhagen", when: "evening", title: "Pack light, {name} — Copenhagen Thursday", sub: "vogue scandinavia editorial" },

  // Night — 21:00 to 04:00
  { id: "earlystart", when: "night", title: "Early start tomorrow, {name}", sub: "car at 06:30 · clean face, no lashes" },
  { id: "getrest", when: "night", title: "Get some rest, {name}", sub: "07:15 call at 180 the strand" },
  { id: "quietnight", when: "night", title: "Quiet night, {name}", sub: "nothing on the sheet until thursday" },
  { id: "lateone", when: "night", title: "Late one, {name}", sub: "keys waiting at hôtel le marais" },
  { id: "lightsout", when: "night", title: "Lights out, {name} — big day tomorrow", sub: "prada fw26 runway hold confirmed" },
];

export default function TestingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState(BOOKINGS);
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  // "any" on the server; the real bucket lands after mount so SSR never mismatches.
  const [bucket, setBucket] = useState("any");
  const [prevBucket, setPrevBucket] = useState("any");

  // Reset welcome rotation whenever time bucket advances without cascading effects
  if (bucket !== prevBucket) {
    setPrevBucket(bucket);
    setWelcomeIndex(0);
  }

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [urgentMessage, setUrgentMessage] = useState(null);

  const profileContainerRef = useRef(null);

  // Follow the clock so the greeting rolls over without a reload.
  useEffect(() => {
    const sync = () => {
      const next = timeBucket(new Date().getHours());
      setBucket((prev) => (prev === next ? prev : next));
    };
    sync();
    const id = setInterval(sync, 60000);
    return () => clearInterval(id);
  }, []);

  // Bucket matches first so the resting "any" lines don't win the opening slot.
  const welcomeSet = useMemo(
    () => [
      ...WELCOME_MESSAGES.filter((m) => m.when === bucket),
      ...WELCOME_MESSAGES.filter((m) => m.when === "any"),
    ],
    [bucket]
  );
  const welcome = welcomeSet[welcomeIndex % welcomeSet.length];

  const triggerUrgentMessage = useCallback(() => {
    const id = "urgent-" + Date.now();
    const newUrgent = {
      id,
      author: "Nadia Okonkwo",
      role: "Senior Agent",
      time: "Just now",
      title: "Call time moved · Prada FW26",
      body: "Call time moved up to 07:15 AM tomorrow for Prada FW26 fitting at 180 The Strand. Car pickup at 06:30 outside your flat. Confirm ASAP.",
      acknowledged: false,
      acknowledgedAt: null,
    };
    setUrgentMessage(newUrgent);

    // Push into notifications list as the top urgent notification
    setNotifications((prev) => [
      {
        id,
        title: "Call time moved · Prada FW26",
        desc: "Prada FW26 fitting moved to 07:15 AM tomorrow at 180 The Strand. Car pickup at 06:30 outside your flat. Confirm ASAP.",
        author: "Nadia Okonkwo",
        time: "Just now",
        unread: true,
        urgent: true,
        acknowledged: false,
      },
      ...prev.filter((n) => !n.urgent),
    ]);
  }, []);

  const acknowledgeUrgent = useCallback(() => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setUrgentMessage((prev) => (prev ? { ...prev, acknowledged: true, acknowledgedAt: now } : null));
    setNotifications((prev) =>
      prev.map((n) => (n.urgent ? { ...n, acknowledged: true, acknowledgedAt: now, unread: false } : n)),
    );
  }, []);

  /* Clicking the alert — in the feed or in the rail — is "seen, I'm on it".
     It is not the same as confirming receipt, which actually answers Nadia, so
     it only stops the card shouting: the ring stops, the lift goes, the whole
     thing recedes. Both copies dim together because they are one alert. */
  const markUrgentSeen = useCallback(() => {
    setUrgentMessage((prev) => (prev && !prev.seen ? { ...prev, seen: true } : prev));
    setNotifications((prev) =>
      prev.map((n) => (n.urgent && !n.seen ? { ...n, seen: true, unread: false } : n)),
    );
  }, []);

  // Auto-trigger an urgent message on mount so the user immediately sees it happen live!
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerUrgentMessage();
    }, 900);
    return () => clearTimeout(timer);
  }, [triggerUrgentMessage]);

  // Close popovers on click outside or on pressing Escape
  useEffect(() => {
    function handlePointerDown(e) {
      if (
        profileMenuOpen &&
        profileContainerRef.current &&
        !profileContainerRef.current.contains(e.target)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setProfileMenuOpen(false);
      }
    }

    if (profileMenuOpen) {
      document.addEventListener("pointerdown", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  // Nested concentric border radius calculation: R_outer = R_inner + gap
  const cardGap = 16; // Uniform 16px gap on left, right, top, and bottom
  const innerRadius = 16; // 16px inner component roundness
  const appleRadius = innerRadius + cardGap; // 32px: calculated outer roundness (R_inner + gap)
  const railWidth = 55; // 55px closer width

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleTabClick = (id) => {
    setActiveTab(id);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div style={LIGHT} className="relative h-screen w-full select-none overflow-hidden bg-background">
      {/* Edge-to-edge shell — rail flush left, Apple 32px squircle content card inset */}
      <div className="flex h-full w-full">
        {/* Left Icon Rail — 55px width, z-50 ensures tooltips and popovers are ALWAYS in front of the main card */}
        <aside
          style={{ width: `${railWidth}px` }}
          className="relative z-50 flex shrink-0 flex-col items-center bg-sidebar pt-[30px] pb-[24px]"
        >
          {/* Model Photo (Zara) — click opens profile popover with bell-identical border arrangement */}
          <div ref={profileContainerRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen((prev) => !prev);
                setNotificationsOpen(false);
              }}
              aria-label="Zara Profile"
              aria-expanded={profileMenuOpen}
              className={`group relative grid h-[38px] w-[38px] place-items-center rounded-[12px] p-0.5 transition-all duration-150 ease-out active:scale-90 ${
                profileMenuOpen
                  ? "ring-2 ring-foreground shadow-sm"
                  : "hover:ring-2 hover:ring-border-strong hover:scale-105"
              }`}
            >
              <img
                src="/images/model_zara.jpg"
                alt="Zara"
                className="h-full w-full rounded-[10px] object-cover object-center shadow-xs"
              />
              {/* Online status pip */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />

              {!profileMenuOpen && (
                <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  Zara · Profile
                </span>
              )}
            </button>

            {/* Zara Profile Popover — Concentric radii (20px) and exact 14px balanced spacing from top and left of the main card */}
            {profileMenuOpen && (
              <div
                style={{ borderRadius: "20px" }}
                className="absolute top-[-6px] left-[calc(100%+22.5px)] z-50 w-[284px] overflow-hidden border border-black/[0.08] dark:border-white/[0.08] bg-surface p-3 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-border/60 px-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/model_zara.jpg"
                      alt="Zara"
                      className="h-9 w-9 rounded-full object-cover shadow-xs"
                    />
                    <div>
                      <p className="text-[13px] font-semibold text-foreground leading-tight">Zara</p>
                      <p className="text-[10.5px] italic text-muted-foreground leading-tight mt-0.5">New Face Model · London / Paris</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen(false)}
                    aria-label="Close profile"
                    className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors active:scale-90"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>

                {/* Profile Links */}
                <div className="mt-2 space-y-1">
                  <Link
                    href="/talent/portfolio"
                    onClick={() => setProfileMenuOpen(false)}
                    className="group flex items-center justify-between rounded-[10px] p-2 text-foreground transition-all duration-150 hover:bg-surface-muted/90 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-7 w-7 place-items-center rounded-[8px] bg-surface-muted text-foreground transition-colors">
                        <Camera size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[12px] font-medium leading-tight text-foreground">Portfolio & Polaroids</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">58 looks · Active</span>
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>

                  <Link
                    href="/talent/portfolio"
                    onClick={() => setProfileMenuOpen(false)}
                    className="group flex items-center justify-between rounded-[10px] p-2 text-foreground transition-all duration-150 hover:bg-surface-muted/90 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-7 w-7 place-items-center rounded-[8px] bg-surface-muted text-foreground transition-colors">
                        <IdCard size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[12px] font-medium leading-tight text-foreground">Comp Card & Digitals</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Measurements verified</span>
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>

                  <Link
                    href="/talent/documents"
                    onClick={() => setProfileMenuOpen(false)}
                    className="group flex items-center justify-between rounded-[10px] p-2 text-foreground transition-all duration-150 hover:bg-surface-muted/90 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-7 w-7 place-items-center rounded-[8px] bg-surface-muted text-foreground transition-colors">
                        <FileText size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[12px] font-medium leading-tight text-foreground">Documents</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Contracts, Releases & Visas</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="rounded-full bg-brand/10 px-1.5 py-0.2 text-[9px] font-semibold text-brand">3</span>
                      <ChevronRight size={13} className="text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                  </Link>

                  <Link
                    href="/talent/overview"
                    onClick={() => setProfileMenuOpen(false)}
                    className="group flex items-center justify-between rounded-[10px] p-2 text-foreground transition-all duration-150 hover:bg-surface-muted/90 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-7 w-7 place-items-center rounded-[8px] bg-surface-muted text-foreground transition-colors">
                        <Settings size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[12px] font-medium leading-tight text-foreground">Account Settings</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Preferences & Agency link</span>
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </div>

                {/* Footer */}
                <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between px-1">
                  <span className="text-[10.5px] text-muted-foreground/70">Signed in as Zara</span>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen(false)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-destructive hover:bg-destructive/10 transition-colors px-2 py-1 rounded-[6px]"
                  >
                    <LogOut size={12} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Navigation */}
          <nav className="mt-[54px] flex flex-col items-center gap-[14px]">
            {PRIMARY_NAV.map(({ id, label, Icon, badge }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTabClick(id)}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`rail-btn group relative flex h-[38px] w-[38px] items-center justify-center rounded-[14px] transition-all duration-150 ease-out active:scale-92 ${
                    active
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  <Icon
                    size={20}
                    weight={active ? "fill" : "regular"}
                    className="transition-transform duration-150 group-hover:scale-105"
                  />

                  {badge && (
                    <span
                      className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9.5px] font-bold ring-2 ring-sidebar ${
                        id === "messages" && urgentMessage && !urgentMessage.acknowledged
                          ? "bg-[var(--urgent)] text-white animate-pulse shadow-sm"
                          : active
                          ? "hidden"
                          : "bg-brand text-brand-foreground"
                      }`}
                    >
                      {id === "messages" && urgentMessage && !urgentMessage.acknowledged ? "!" : badge}
                    </span>
                  )}

                  <span className="rail-tip">{label}</span>
                </button>
              );
            })}

            {/* Separator */}
            <span aria-hidden className="my-[4px] h-px w-5 bg-border/80" />

            {/* Community Navigation */}
            {COMMUNITY_NAV.map(({ id, label, Icon, badge }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTabClick(id)}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`rail-btn group relative flex h-[38px] w-[38px] items-center justify-center rounded-[14px] transition-all duration-150 ease-out active:scale-92 ${
                    active
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  <Icon
                    size={20}
                    weight={active ? "fill" : "regular"}
                    className="transition-transform duration-150 group-hover:scale-105"
                  />

                  {badge && !active && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-semibold text-brand-foreground ring-2 ring-sidebar">
                      {badge}
                    </span>
                  )}

                  <span className="rail-tip">{label}</span>
                </button>
              );
            })}
          </nav>

        </aside>

        {/* Main Testing Card with concentric squircle curvature: R_outer = R_inner + gap */}
        <main
          style={{
            borderRadius: `${appleRadius}px`,
            "--card-gap": `${cardGap}px`,
            "--inner-radius": `${innerRadius}px`,
            "--outer-radius": `${appleRadius}px`,
          }}
          className="my-[10px] min-w-0 flex-1 overflow-hidden border border-black/[0.08] dark:border-white/[0.08] bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.03),0_16px_48px_rgba(0,0,0,0.06)] flex flex-col"
        >
          {/* Top Apple-style Header with ZARA title and Urgent Message trigger */}
          <header
            style={{
              paddingLeft: `${cardGap}px`,
              paddingRight: `${cardGap}px`,
            }}
            className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-surface/70 backdrop-blur-md"
          >
            {/* Left title: Dynamic Welcome Greeting with new face model subtitle */}
            <div
              onClick={() => setWelcomeIndex((prev) => (prev + 1) % welcomeSet.length)}
              className="flex cursor-pointer flex-col justify-center transition-opacity hover:opacity-85 select-none"
              title="Click to cycle greetings for this time of day"
            >
              <span
                style={{ fontFamily: "'Arno Pro', Georgia, serif" }}
                className="text-[18px] font-bold tracking-[0.01em] text-foreground leading-none"
              >
                {withName(welcome.title)}
              </span>
              <span className="text-[10px] font-normal tracking-wide text-muted-foreground lowercase select-none leading-none mt-1">
                {welcome.sub}
              </span>
            </div>



            {/* Right: Location representation — clean editorial luxury styling without green dot */}
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/80 px-3.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground shadow-2xs backdrop-blur-xs transition-colors hover:text-foreground hover:border-border">
              <span>London</span>
              <span className="h-2.5 w-px bg-border/80" />
              <span>Paris</span>
            </div>
          </header>



          {/* Main content display based on activeTab */}
          {activeTab === "overview" ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <HomeOverview
                bookings={bookings}
                onGoTo={handleTabClick}
                cardGap={cardGap}
                innerRadius={innerRadius}
              />
            </div>
          ) : activeTab === "bookings" ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <BookingsView
                bookings={bookings}
                setBookings={setBookings}
                onGoTo={handleTabClick}
                cardGap={cardGap}
                innerRadius={innerRadius}
              />
            </div>
          ) : activeTab === "calendar" ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <CalendarView
                bookings={bookings}
                onGoTo={handleTabClick}
                cardGap={cardGap}
                innerRadius={innerRadius}
              />
            </div>
          ) : activeTab === "castings" || activeTab === "milestones" ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <CommunityView
                tab={activeTab}
                bookings={bookings}
                cardGap={cardGap}
                innerRadius={innerRadius}
              />
            </div>
          ) : activeTab === "payments" ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <PaymentsView
                onGoTo={handleTabClick}
                cardGap={cardGap}
                innerRadius={innerRadius}
              />
            </div>
          ) : activeTab === "messages" ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <CardFeed
                urgentMessage={urgentMessage}
                onAcknowledge={acknowledgeUrgent}
                onSeen={markUrgentSeen}
                onDismissUrgent={() => setUrgentMessage(null)}
                cardGap={cardGap}
                innerRadius={innerRadius}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="mx-auto mb-3.5 grid h-12 w-12 place-items-center rounded-2xl bg-surface-muted border border-border/60 shadow-2xs">
                  <BellSimple size={26} weight="duotone" className="text-brand" />
                </div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight capitalize">
                  {activeTab} Screen
                </h3>
                <p className="mt-1 text-[12.5px] text-muted-foreground leading-relaxed">
                  Candor Atelier system active. Switch tabs on the left navigation rail or return to Home for today&apos;s active call sheet and options.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Notification log — lives in the background gutter beside the card,
            fixed at 304px matching the names rail width on the right */}
        <aside className="hidden w-[304px] shrink-0 flex-col my-[10px] pr-5 pl-5 xl:flex">
          {/* Header row aligned with the main card's h-14 header and horizontal baseline border */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/60">
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Notifications
              </h2>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-brand px-1.5 py-0.5 text-[9.5px] font-bold text-brand-foreground">
                  {unreadCount}
                </span>
              ) : null}
            </div>
            {notifications.length > 0 ? (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="rounded-md px-1.5 py-0.5 text-[10.5px] text-muted-foreground transition-[color,transform] duration-140 ease-[var(--ease-out)] hover:text-foreground active:scale-[0.96]"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pt-2.5 pb-2.5">
            {notifications.length === 0 ? (
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                Nothing yet. Bookings, payments and contract activity land here.
              </p>
            ) : (
              <ul className="stagger-in space-y-2">
                {notifications.map((n) => (
                  <li key={n.id}>
                    {n.urgent ? (
                      /* Subtle Urgent Notification Card */
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          markUrgentSeen();
                          handleTabClick("messages");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            markUrgentSeen();
                            handleTabClick("messages");
                          }
                        }}
                        title="Click to view message in Messages"
                        className={`group relative flex w-full cursor-pointer gap-2.5 rounded-xl p-3 text-left transition-all duration-150 active:scale-[0.99] border ${
                          n.seen
                            ? "border-border/70 bg-surface/85 hover:bg-surface opacity-80 hover:opacity-100 shadow-2xs hover:shadow-xs"
                            : "border-[var(--urgent-line)]/90 bg-[var(--urgent-soft)]/55 hover:bg-[var(--urgent-soft)]/85 hover:border-[var(--urgent)]/50 shadow-2xs hover:shadow-xs"
                        }`}
                      >
                        {/* Bell Icon: Animated ring when unseen */}
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[var(--urgent)]">
                          <BellSimple
                            size={15}
                            weight="fill"
                            className={n.seen ? "opacity-60" : "animate-bell-ring"}
                          />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          {/* Top row: Urgent badge + Agent name + Time / Hover Dismiss */}
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="rounded bg-[var(--urgent)] px-1.5 py-0.5 text-[8.5px] font-bold tracking-[0.06em] text-white uppercase leading-none shrink-0">
                                Urgent
                              </span>
                              <span className="truncate text-[11.5px] font-semibold text-foreground">
                                {n.author || "Nadia Okonkwo"}, Agent
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="font-mono text-[9.5px] tabular-nums text-muted-foreground/75 group-hover:hidden">
                                {n.time}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifications((prev) => prev.filter((item) => item.id !== n.id));
                                }}
                                className="hidden group-hover:grid h-4 w-4 place-items-center rounded-full text-muted-foreground/45 hover:bg-surface-muted hover:text-foreground transition-colors"
                                aria-label="Dismiss notification"
                              >
                                <X size={11} weight="bold" />
                              </button>
                            </div>
                          </div>

                          {/* Subtitle: Clean truncated snippet with ellipsis */}
                          <p className="mt-1 truncate text-[11px] leading-relaxed text-muted-foreground">
                            <span className="font-medium text-foreground/85">Call time moved</span>
                            {" · "}
                            <span>Prada FW26 fitting at 07:15 AM tomorrow...</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Refined standard notification card */
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
                          );
                          const lower = n.title.toLowerCase();
                          if (lower.includes("booking")) handleTabClick("bookings");
                          else if (lower.includes("payment")) handleTabClick("payments");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setNotifications((prev) =>
                              prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
                            );
                          }
                        }}
                        className={`group relative flex w-full cursor-pointer gap-2.5 rounded-xl p-3 text-left transition-all duration-150 active:scale-[0.99] border bg-surface shadow-2xs hover:shadow-xs ${
                          n.unread
                            ? "border-border/85 hover:border-border-strong"
                            : "border-border/60 bg-surface/85 opacity-80 hover:opacity-100 hover:border-border/80 hover:bg-surface"
                        }`}
                      >
                        {/* Unread dot / Status indicator */}
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                          {n.unread ? (
                            <span className="relative flex h-2 w-2">
                              <span className="h-2 w-2 rounded-full bg-brand ring-2 ring-brand/20" />
                            </span>
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-border/80 group-hover:bg-muted-foreground/35 transition-colors" />
                          )}
                        </div>

                        {/* Text details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-1.5">
                            <span
                              className={`truncate text-[12px] leading-snug tracking-tight ${
                                n.unread
                                  ? "font-semibold text-foreground"
                                  : "font-medium text-foreground/75"
                              }`}
                            >
                              {n.title}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="font-mono text-[9.5px] tabular-nums text-muted-foreground/70 group-hover:hidden">
                                {n.time}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifications((prev) => prev.filter((item) => item.id !== n.id));
                                }}
                                className="hidden group-hover:grid h-4 w-4 place-items-center rounded-full text-muted-foreground/45 hover:bg-surface-muted hover:text-foreground transition-colors"
                                aria-label="Dismiss notification"
                              >
                                <X size={11} weight="bold" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-1 truncate text-[11px] leading-relaxed text-muted-foreground">
                            {n.desc}
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
