"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Phone,
  Download,
  ExternalLink,
  ArrowUpRight,
  Check,
  Copy,
  ChevronRight,
  Sparkles,
  AlertCircle,
  FileText,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Shirt,
  X,
  Building2,
  Send,
  Camera,
  CheckCircle2,
  Info,
  Navigation,
} from "lucide-react";

const CALL_SHEET = {
  client: "PRADA",
  season: "AW26",
  project: "Campaign Fitting & Runway Preview",
  code: "PRD-26-LON-04",
  callTime: "07:15 AM",
  wrapTime: "13:00 PM",
  pickupTime: "06:30 AM",
  driver: "Marcus Vance",
  driverPhone: "+44 7911 204891",
  vehicle: "Mercedes V-Class (Black)",
  studio: "180 The Strand",
  room: "Studio 4, South Wing",
  address: "180 The Strand, London WC2R 1EA",
  photographer: "Willy Vanderperre",
  stylist: "Olivier Rizzo",
  hair: "Guido Palau",
  makeup: "Pat McGrath MBE",
};

const SCHEDULE_STEPS = [
  { time: "06:30 AM", title: "Chauffeur Pickup", desc: "Marcus · Mercedes V-Class", status: "next" },
  { time: "07:15 AM", title: "Call & Hair / Makeup", desc: "Studio 4 · Guido & Pat McGrath", status: "pending" },
  { time: "09:30 AM", title: "First Look Tailoring", desc: "On set with Willy & Olivier", status: "pending" },
  { time: "13:00 PM", title: "Estimated Wrap", desc: "Return transit to Notting Hill", status: "pending" },
];

const UPCOMING_OPTIONS = [
  {
    id: "opt-1",
    client: "Bottega Veneta",
    badge: "1st Option",
    badgeType: "brand",
    project: "Milan Runway & Private Re-See",
    dates: "21–24 Feb",
    city: "Milan",
    rate: "€14,000",
    rateLabel: "Rate Agreed",
    status: "Confirmed Hold by Nadia",
  },
  {
    id: "opt-2",
    client: "Vogue France",
    badge: "1st Option",
    badgeType: "brand",
    project: "Main Editorial Story (12 Pages)",
    dates: "28 Feb",
    city: "Paris",
    rate: "€3,500/d",
    rateLabel: "Day Rate",
    status: "Shoot with David Sims",
  },
  {
    id: "opt-3",
    client: "Acne Studios",
    badge: "Confirmed",
    badgeType: "emerald",
    project: "SS26 Digital Lookbook Direct",
    dates: "14 Mar",
    city: "London",
    rate: "£8,400",
    rateLabel: "Contract Lodged",
    status: "Direct Booking",
  },
  {
    id: "opt-4",
    client: "Burberry",
    badge: "2nd Option",
    badgeType: "muted",
    project: "High Summer Capsule Presentation",
    dates: "18 Mar",
    city: "London",
    rate: "£4,200",
    rateLabel: "Gross Agreed",
    status: "Behind Vittoria C.",
  },
];

const TALENT_MEASUREMENTS = [
  { label: "Height", value: "5'11\"", metric: "180 cm" },
  { label: "Bust", value: "32B", metric: "81 cm" },
  { label: "Waist", value: "24\"", metric: "61 cm" },
  { label: "Hips", value: "34.5\"", metric: "88 cm" },
  { label: "Shoes", value: "39 EU", metric: "6 UK" },
  { label: "Eyes", value: "Hazel", metric: "Dark Brown" },
];

export function TalentHomeView({ onNavigateTab }) {
  const [copiedSpecs, setCopiedSpecs] = useState(false);
  const [showCallSheetModal, setShowCallSheetModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState("lookbook"); // "lookbook" | "beauty"
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Clean bare skin (moisturizer only, zero makeup)", done: true },
    { id: 2, text: "Natural clean dry hair (washed night before, zero product)", done: true },
    { id: 3, text: "Nude seamless undergarments & robe", done: true },
    { id: 4, text: "105mm black casting stiletto heels", done: false },
    { id: 5, text: "Physical Candor hardback portfolio book", done: false },
  ]);

  const toggleCheck = (id) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const copySpecsToClipboard = () => {
    const text = `ZARA ACHEBE — CANDOR DIRECT BOARD
Height: 5'11" (180 cm) | Bust: 32B | Waist: 24" | Hips: 34.5" | Shoes: 39 EU
Hair: Natural Dark Brown | Eyes: Hazel | London · Paris
Agent: Nadia Okonkwo (+44 20 7946 0912)`;
    navigator.clipboard?.writeText(text);
    setCopiedSpecs(true);
    setTimeout(() => setCopiedSpecs(false), 2200);
  };

  const checkedCount = checklist.filter((c) => c.done).length;

  return (
    <div className="h-full overflow-y-auto bg-surface-muted/30 p-6 sm:p-8">
      <div className="mx-auto max-w-[1280px] space-y-6">

        {/* 1. Header Bar: Editorial Title + Quick Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border/50 pb-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
              <span>Candor Atelier</span>
              <span className="opacity-30">/</span>
              <span>Talent Docket</span>
              <span className="opacity-30">/</span>
              <span>Friday, 14 March 2026</span>
            </div>
            <h1
              style={{ fontFamily: "'Arno Pro', Georgia, serif" }}
              className="mt-1 text-[32px] sm:text-[36px] font-normal tracking-[-0.01em] text-foreground leading-tight"
            >
              Overview &amp; Call Sheet
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={copySpecsToClipboard}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-4 py-2 text-[11.5px] font-medium text-foreground shadow-2xs transition-all hover:bg-surface-muted active:scale-[0.97]"
            >
              {copiedSpecs ? (
                <>
                  <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Specs Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-muted-foreground" />
                  <span>Copy Measurements</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowCallSheetModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[11.5px] font-medium text-background shadow-xs transition-all hover:opacity-90 active:scale-[0.97]"
            >
              <FileText size={13} />
              <span>Full Call Sheet</span>
            </button>
          </div>
        </div>

        {/* 2. Top Bento KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* KPI 1: Next On Set */}
          <div className="group relative overflow-hidden rounded-[22px] border border-border/70 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.03)] transition-all hover:border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                Next Call Time
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Tomorrow
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[28px] font-bold tracking-tight text-foreground leading-none">
                07:15
              </span>
              <span className="text-[12px] font-semibold text-muted-foreground">AM BST</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11.5px]">
              <span className="font-semibold text-foreground truncate">PRADA · AW26 Fitting</span>
              <span className="text-muted-foreground shrink-0">180 Strand</span>
            </div>
          </div>

          {/* KPI 2: Active Pipeline */}
          <div className="group relative overflow-hidden rounded-[22px] border border-border/70 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.03)] transition-all hover:border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                Active Holds
              </span>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                2 1st Options
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[28px] font-bold tracking-tight text-foreground leading-none">
                4
              </span>
              <span className="text-[12px] font-semibold text-muted-foreground">Engagements</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11.5px]">
              <span className="text-muted-foreground truncate">Bottega Veneta, Vogue, Acne</span>
              <span className="font-semibold text-foreground">€14k max</span>
            </div>
          </div>

          {/* KPI 3: Cleared Escrow */}
          <div className="group relative overflow-hidden rounded-[22px] border border-border/70 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.03)] transition-all hover:border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                Cleared Escrow
              </span>
              <button
                type="button"
                onClick={() => setShowPayoutModal(true)}
                className="text-[10.5px] font-semibold text-brand hover:underline"
              >
                Withdraw →
              </button>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[28px] font-bold tracking-tight text-foreground leading-none">
                £14,850
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Cleared</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11.5px]">
              <span className="text-muted-foreground">Barclays (**8492)</span>
              <span className="text-[11px] text-muted-foreground font-mono">+£22.4k hold</span>
            </div>
          </div>

          {/* KPI 4: YTD Confirmed Days */}
          <div className="group relative overflow-hidden rounded-[22px] border border-border/70 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.03)] transition-all hover:border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                Direct Board YTD
              </span>
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                100% On-Set
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[28px] font-bold tracking-tight text-foreground leading-none">
                14
              </span>
              <span className="text-[12px] font-semibold text-muted-foreground">Bookings Completed</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11.5px]">
              <span className="text-muted-foreground">Total cleared</span>
              <span className="font-semibold text-foreground font-mono">£89,200</span>
            </div>
          </div>

        </div>

        {/* 3. Main Dashboard Grid (Left 8 Cols: Production & Holds / Right 4 Cols: Dossier, Wallet, Comms) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* LEFT 8 COLUMNS */}
          <div className="space-y-6 lg:col-span-8">

            {/* A. Hero Production Call Sheet Ticket */}
            <div className="overflow-hidden rounded-[24px] border border-border/80 bg-surface shadow-[0_2px_12px_rgba(0,0,0,0.02),0_12px_36px_rgba(0,0,0,0.03)]">
              {/* Dark Contrast Editorial Top Header */}
              <div className="flex items-center justify-between bg-foreground px-6 py-4 text-background">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-background/15 text-background font-mono text-[11px] font-bold">
                    PR
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-background/70">
                        {CALL_SHEET.client} · {CALL_SHEET.season}
                      </span>
                      <span className="rounded-full bg-background/20 px-2 py-0.2 text-[9.5px] font-semibold tracking-wider uppercase text-background">
                        Call Sheet Issued
                      </span>
                    </div>
                    <h2
                      style={{ fontFamily: "'Arno Pro', Georgia, serif" }}
                      className="text-[20px] sm:text-[22px] font-normal tracking-tight text-background leading-none mt-0.5"
                    >
                      {CALL_SHEET.project}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-wider text-background/60">
                    Booking Code
                  </span>
                  <span className="font-mono text-[12px] font-bold text-background">
                    {CALL_SHEET.code}
                  </span>
                </div>
              </div>

              {/* Call Sheet Content Body */}
              <div className="p-6 space-y-5">

                {/* Day-of Schedule Timeline Stepper */}
                <div className="rounded-[18px] bg-surface-muted/40 p-4 border border-border/50">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                    Tomorrow&apos;s Run of Show
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SCHEDULE_STEPS.map((step, idx) => (
                      <div
                        key={step.time}
                        className={`relative rounded-xl p-3 border transition-colors ${
                          step.status === "next"
                            ? "bg-surface border-foreground/30 shadow-2xs ring-1 ring-foreground/10"
                            : "bg-surface/50 border-border/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-foreground">
                            {step.time}
                          </span>
                          {step.status === "next" && (
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                        </div>
                        <span className="block text-[12px] font-bold text-foreground mt-1">
                          {step.title}
                        </span>
                        <span className="block text-[10.5px] text-muted-foreground mt-0.5 leading-snug">
                          {step.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logistics & Location Duo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 rounded-[18px] border border-border/60 bg-surface p-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-muted border border-border/60 text-foreground">
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Production Studio
                      </span>
                      <span className="block text-[13px] font-bold text-foreground mt-0.5">
                        {CALL_SHEET.studio}
                      </span>
                      <span className="block text-[11.5px] text-muted-foreground">
                        {CALL_SHEET.room} · {CALL_SHEET.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-[18px] border border-border/60 bg-surface p-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-muted border border-border/60 text-foreground">
                      <Car size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Private Chauffeur
                      </span>
                      <span className="block text-[13px] font-bold text-foreground mt-0.5">
                        {CALL_SHEET.pickupTime} Pickup · {CALL_SHEET.driver}
                      </span>
                      <span className="block text-[11.5px] text-muted-foreground">
                        {CALL_SHEET.vehicle} · {CALL_SHEET.driverPhone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Creative Team Credits */}
                <div className="rounded-[18px] border border-border/60 bg-surface p-4">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2.5">
                    On-Set Creative Direction
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
                    <div>
                      <span className="block text-[10px] text-muted-foreground">Photographer</span>
                      <span className="font-semibold text-foreground">{CALL_SHEET.photographer}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-muted-foreground">Stylist</span>
                      <span className="font-semibold text-foreground">{CALL_SHEET.stylist}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-muted-foreground">Hair Lead</span>
                      <span className="font-semibold text-foreground">{CALL_SHEET.hair}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-muted-foreground">Makeup Lead</span>
                      <span className="font-semibold text-foreground">{CALL_SHEET.makeup}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Model Kit Checklist */}
                <div className="rounded-[18px] border border-border/60 bg-surface p-4">
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Shirt size={14} className="text-brand" />
                      <span className="text-[12px] font-bold text-foreground">
                        Shoot Kit Preparation &amp; Protocol
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {checkedCount} of {checklist.length} verified ready
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {checklist.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleCheck(item.id)}
                        className="group flex w-full items-center gap-2.5 text-left text-[12px] transition-colors py-0.5"
                      >
                        <span
                          className={`grid h-4.5 w-4.5 shrink-0 place-items-center rounded-[5px] border transition-colors ${
                            item.done
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-foreground bg-surface"
                          }`}
                        >
                          {item.done && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span
                          className={`flex-1 ${
                            item.done
                              ? "text-muted-foreground/70 line-through"
                              : "text-foreground font-medium"
                          }`}
                        >
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Call Sheet Bottom Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/40 text-[12px]">
                  <a
                    href={`tel:${CALL_SHEET.driverPhone}`}
                    className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone size={13} />
                    <span>Call Driver Marcus</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowCallSheetModal(true)}
                    className="flex items-center gap-1 font-semibold text-brand hover:underline"
                  >
                    <span>View Production Briefing PDF</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>

              </div>
            </div>

            {/* B. Active Agency Options & Booking Holds Table */}
            <div className="overflow-hidden rounded-[24px] border border-border/80 bg-surface shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                <div>
                  <h3 className="text-[14.5px] font-bold text-foreground">
                    Active Options &amp; Booking Pipeline
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Live casting options currently held by Candor Direct Board on your behalf.
                  </p>
                </div>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-[11px] font-bold text-muted-foreground">
                  4 Active Holds
                </span>
              </div>

              {/* Clean Luxury Data Rows */}
              <div className="divide-y divide-border/40">
                {UPCOMING_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 hover:bg-surface-muted/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[14px] font-bold text-foreground">
                          {opt.client}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.2 text-[9.5px] font-bold uppercase tracking-wider ${
                            opt.badgeType === "brand"
                              ? "bg-brand/10 text-brand border-brand/20"
                              : opt.badgeType === "emerald"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                              : "bg-surface-muted text-muted-foreground border-border"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        {opt.project}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{opt.city}</span>
                        <span>·</span>
                        <span>{opt.dates}</span>
                        <span>·</span>
                        <span className="text-foreground/80 font-medium">{opt.status}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="block text-[14.5px] font-bold text-foreground font-mono">
                        {opt.rate}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">
                        {opt.rateLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLUMNS: Model Dossier, Financial Escrow, and Agent Messages */}
          <div className="space-y-6 lg:col-span-4">

            {/* CARD 1: Model Casting Dossier & Visual Comp */}
            <div className="overflow-hidden rounded-[24px] border border-border/80 bg-surface p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              {/* Header with Photo Selector */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={activePhotoTab === "lookbook" ? "/images/zara_comp_card.jpg" : "/images/model_zara.jpg"}
                    alt="Zara Achebe"
                    className="h-11 w-11 rounded-xl object-cover ring-1 ring-border shadow-2xs"
                  />
                  <div>
                    <h4 className="text-[14px] font-bold text-foreground leading-tight">
                      Zara Achebe
                    </h4>
                    <span className="text-[11px] text-muted-foreground">
                      Agency Ref: <span className="font-mono text-foreground font-semibold">ZA-8821</span>
                    </span>
                  </div>
                </div>

                {/* Lookbook / Beauty tab toggle */}
                <div className="flex items-center rounded-full bg-surface-muted p-0.5 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setActivePhotoTab("lookbook")}
                    className={`rounded-full px-2 py-0.5 transition-all ${
                      activePhotoTab === "lookbook"
                        ? "bg-surface text-foreground shadow-2xs font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    Lookbook
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePhotoTab("beauty")}
                    className={`rounded-full px-2 py-0.5 transition-all ${
                      activePhotoTab === "beauty"
                        ? "bg-surface text-foreground shadow-2xs font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    Beauty
                  </button>
                </div>
              </div>

              {/* Photo Showcase Thumbnail */}
              <div className="mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-muted relative border border-border/50">
                <img
                  src={activePhotoTab === "lookbook" ? "/images/zara_comp_card.jpg" : "/images/model_zara.jpg"}
                  alt="Zara"
                  className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Measurement Specs 2x3 Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {TALENT_MEASUREMENTS.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl border border-border/50 bg-surface-muted/40 p-2.5 text-center"
                  >
                    <span className="block text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                      {spec.label}
                    </span>
                    <span className="block text-[14px] font-bold text-foreground mt-0.5 leading-tight">
                      {spec.value}
                    </span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">
                      {spec.metric}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={copySpecsToClipboard}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-surface py-2 text-[11.5px] font-semibold text-foreground hover:bg-surface-muted transition-colors active:scale-95"
                >
                  {copiedSpecs ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedSpecs ? "Specs Copied" : "Copy Specs"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab?.("portfolio")}
                  className="flex items-center justify-center gap-1 rounded-xl border border-border/80 bg-surface px-3 py-2 text-[11.5px] font-semibold text-foreground hover:bg-surface-muted transition-colors active:scale-95"
                >
                  <span>Book (16)</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* CARD 2: Escrow Wallet & Financial Clearance */}
            <div className="rounded-[24px] border border-border/80 bg-surface p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <Wallet size={15} className="text-brand" />
                  <h4 className="text-[13px] font-bold text-foreground">
                    Cleared Escrow &amp; Balance
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Barclays **8492
                </span>
              </div>

              <div className="mt-4 rounded-[18px] bg-surface-muted/60 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10.5px] uppercase font-bold tracking-wider text-muted-foreground">
                    Available for Payout
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300">
                    Cleared Net
                  </span>
                </div>
                <span className="mt-1 block text-[26px] font-bold tracking-tight text-foreground font-mono">
                  £14,850.00
                </span>

                {/* Progress bar visual of escrow */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-[10.5px] text-muted-foreground">
                    <span>Cleared (40%)</span>
                    <span>In 30d Clearance: £22,400</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div className="h-full w-[40%] rounded-full bg-foreground" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPayoutModal(true)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground py-2.5 text-[12px] font-semibold text-background shadow-xs hover:opacity-90 transition-opacity active:scale-95"
              >
                <span>Request Wire Transfer (£14,850)</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            {/* CARD 3: Agent Messages & Communications */}
            <div className="rounded-[24px] border border-border/80 bg-surface p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand" />
                  <h4 className="text-[13px] font-bold text-foreground">
                    Agent Dispatch
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.("messages")}
                  className="text-[11px] font-semibold text-brand hover:underline"
                >
                  View All (3)
                </button>
              </div>

              <div className="mt-3.5 space-y-2.5">
                <div
                  onClick={() => onNavigateTab?.("messages")}
                  className="cursor-pointer rounded-xl border border-border/60 bg-surface-muted/30 p-3 transition-colors hover:bg-surface-muted/70"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-foreground">Nadia Okonkwo</span>
                    <span className="text-[10px] text-muted-foreground font-mono">18m ago</span>
                  </div>
                  <span className="block text-[11.5px] font-semibold text-brand mt-0.5">
                    Prada call sheet confirmed
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    Driver Marcus is locked in for 06:30 AM pickup. Please have physical book ready.
                  </p>
                </div>

                <div
                  onClick={() => onNavigateTab?.("messages")}
                  className="cursor-pointer rounded-xl border border-border/60 bg-surface-muted/30 p-3 transition-colors hover:bg-surface-muted/70"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-foreground">Candor Finance</span>
                    <span className="text-[10px] text-muted-foreground font-mono">2h ago</span>
                  </div>
                  <span className="block text-[11.5px] font-medium text-foreground mt-0.5">
                    Vogue Scandinavia escrow cleared
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    £8,400 net cleared from Vogue Scandinavia. Ready for immediate disbursement.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* MODAL: Full Call Sheet Briefing Modal */}
      {showCallSheetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm transition-all"
          onClick={() => setShowCallSheetModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-[24px] border border-border/80 bg-surface p-7 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border/50 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase">
                  CONFIRMATION #{CALL_SHEET.code}
                </span>
                <h3
                  style={{ fontFamily: "'Arno Pro', Georgia, serif" }}
                  className="mt-1 text-[24px] font-bold text-foreground"
                >
                  Prada Autumn/Winter 2026 Fitting
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCallSheetModal(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-[12.5px]">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-surface-muted/50 p-3.5">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Date &amp; Time</span>
                  <span className="font-semibold text-foreground">Tomorrow · 07:15 AM</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Estimated Wrap</span>
                  <span className="font-semibold text-foreground">{CALL_SHEET.wrapTime}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Location</span>
                  <span className="font-semibold text-foreground">{CALL_SHEET.studio} ({CALL_SHEET.room})</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Chauffeur</span>
                  <span className="font-semibold text-foreground">{CALL_SHEET.driver} ({CALL_SHEET.driverPhone})</span>
                </div>
              </div>

              <div>
                <span className="block text-[10.5px] font-bold text-foreground uppercase tracking-wider mb-1">
                  Hair &amp; Makeup Protocol
                </span>
                <p className="text-muted-foreground text-[12px] leading-relaxed">
                  Clean bare skin. Zero tinted moisturizers, zero mascara. Natural clean dry hair washed the night before with zero product.
                </p>
              </div>

              <div>
                <span className="block text-[10.5px] font-bold text-foreground uppercase tracking-wider mb-1">
                  Required Wardrobe Kit
                </span>
                <p className="text-muted-foreground text-[12px] leading-relaxed">
                  Flesh-toned seamless underwear, nude thong, dressing gown or buttoned shirt, clean black 105mm casting heels, physical Candor portfolio.
                </p>
              </div>

              <div>
                <span className="block text-[10.5px] font-bold text-foreground uppercase tracking-wider mb-1">
                  Emergency Agency Contact
                </span>
                <p className="text-muted-foreground text-[12px]">
                  Candor 24h Production Desk: <span className="text-foreground font-bold">+44 20 7946 0912</span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-border/50">
              <button
                type="button"
                onClick={() => setShowCallSheetModal(false)}
                className="rounded-xl border border-border px-4 py-2 text-[12px] font-medium text-foreground hover:bg-surface-muted"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Call sheet PDF downloaded to device.");
                  setShowCallSheetModal(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-[12px] font-semibold text-background hover:opacity-90"
              >
                <Download size={13} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Wire Payout Modal */}
      {showPayoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm transition-all"
          onClick={() => setShowPayoutModal(false)}
        >
          <div
            className="w-full max-w-md rounded-[24px] border border-border/80 bg-surface p-7 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border/50 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase">
                  AGENCY ESCROW CLEARANCE
                </span>
                <h3
                  style={{ fontFamily: "'Arno Pro', Georgia, serif" }}
                  className="mt-1 text-[22px] font-bold text-foreground"
                >
                  Disburse Cleared Funds
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-3.5 text-[12.5px]">
              <div className="rounded-xl bg-surface-muted/60 p-4">
                <span className="block text-[10.5px] uppercase font-bold text-muted-foreground tracking-wider">
                  Available for Immediate Wire
                </span>
                <span className="mt-1 block text-[26px] font-mono font-bold text-foreground">
                  £14,850.00
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Destination: Barclays UK Commercial (**8492) · Zara Achebe
                </span>
              </div>

              {payoutRequested ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold block">Wire Transfer Requested</span>
                  <span className="text-[11.5px] mt-0.5 block">
                    Reference #WIR-2026-9481 has been sent to Candor Finance. Cleared funds arrive within 2 business hours.
                  </span>
                </div>
              ) : (
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Transfers initiated before 16:00 BST clear via Faster Payments same day. Standard agency accounting statement will be lodged to your Documents tab.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-border/50">
              <button
                type="button"
                onClick={() => {
                  setShowPayoutModal(false);
                  setPayoutRequested(false);
                }}
                className="rounded-xl border border-border px-4 py-2 text-[12px] font-medium text-foreground hover:bg-surface-muted"
              >
                {payoutRequested ? "Done" : "Cancel"}
              </button>
              {!payoutRequested && (
                <button
                  type="button"
                  onClick={() => setPayoutRequested(true)}
                  className="rounded-xl bg-foreground px-4 py-2 text-[12px] font-semibold text-background hover:opacity-90"
                >
                  Confirm Wire (£14,850)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
