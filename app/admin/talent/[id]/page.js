"use client";

import {
  ArrowLeft,
  AtSign,
  Check,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  bookings,
  invoices,
  documents,
  notifications,
  onboardingSteps,
} from "@/lib/data";
import { useActions, useTalent } from "@/lib/store";

const TODAY = new Date("2026-04-18T00:00:00");

const STATUS_OPTIONS = ["Active", "Inactive", "Pending", "Hold"];
const BOARD_OPTIONS = ["Women's Board", "Men's Board", "New Faces", "Main Board"];
const CATEGORY_OPTIONS = [
  "Fashion",
  "Commercial",
  "Editorial",
  "Fitness",
  "Lifestyle",
  "Plus",
  "Petite",
  "Kids",
];
const CONTRACT_TYPES = ["Exclusive", "Non-exclusive", "Mother-agency"];
const PORTFOLIO_STATUSES = ["Current", "Needs Update", "Pending", "Outdated"];

function parseDate(s) {
  return new Date(`${s}T00:00:00`);
}
function fmtDate(s) {
  if (!s) return "—";
  const d = parseDate(s);
  return `${d.getDate()} ${d.toLocaleString("en-GB", {
    month: "short",
  })} ${d.getFullYear()}`;
}
function shortDate(s) {
  if (!s) return "—";
  const d = parseDate(s);
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })}`;
}
function portfolioTone(v) {
  if (v === "Current") return "text-emerald-700 dark:text-emerald-400";
  if (v === "Needs Update" || v === "Pending")
    return "text-amber-700 dark:text-amber-400";
  if (v === "Outdated") return "text-rose-700 dark:text-rose-400";
  return "text-foreground";
}

export default function TalentDetailPage() {
  const { id } = useParams();
  const talent = useTalent();
  const { updateTalent } = useActions();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  const t = useMemo(() => talent.find((x) => x.id === id), [talent, id]);
  if (!t) return notFound();

  const current = editing && draft ? draft : t;

  const talentBookings = bookings
    .filter((b) => b.talentIds?.includes(id))
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));
  const talentInvoices = invoices.filter((inv) => {
    const b = bookings.find((x) => x.id === inv.booking);
    return b?.talentIds?.includes(id);
  });
  const talentDocs = documents.filter(
    (d) => d.talentId === id || d.talentId === null
  );
  const talentNotifications = notifications
    .filter((n) => n.recipientIds.includes(id))
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

  const contractEnd = parseDate(current.contractEnd);
  const daysToContractEnd = Math.ceil((contractEnd - TODAY) / 86400000);

  const measurementEntries = [
    ["Height", "height", current.height],
    ...Object.entries(current.measurements).map(([k, v]) => [
      k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      `measurements.${k}`,
      v,
    ]),
  ];

  function startEdit() {
    setDraft(JSON.parse(JSON.stringify(t)));
    setEditing(true);
  }
  function cancelEdit() {
    setDraft(null);
    setEditing(false);
  }
  function saveEdit() {
    if (draft) updateTalent(id, draft);
    setEditing(false);
    setDraft(null);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  }

  function patch(path, value) {
    setDraft((prev) => {
      const next = { ...prev };
      const parts = path.split(".");
      let ref = next;
      for (let i = 0; i < parts.length - 1; i++) {
        ref[parts[i]] = { ...ref[parts[i]] };
        ref = ref[parts[i]];
      }
      ref[parts[parts.length - 1]] = value;
      return next;
    });
  }

  const fieldProps = { editing, patch };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link
          href="/admin/talent"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to roster
        </Link>
        <div className="flex items-center gap-2">
          {justSaved && (
            <span className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
              <Check className="h-3 w-3" />
              Saved — reflected on talent dashboard
            </span>
          )}
          {!editing ? (
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
            >
              <Pencil className="h-3 w-3" />
              Edit roster
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-background transition-all hover:-translate-y-[1px]"
              >
                <Save className="h-3 w-3" />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Roster · {current.board}
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">
          ID · {current.id}
        </div>
      </div>

      <div className="grid grid-cols-12 items-start gap-x-6 border-b border-border/60 pb-8">
        <div className="col-span-2">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-muted/60 font-serif text-[26px] font-light italic text-foreground ring-1 ring-border/60">
            {current.avatar}
          </span>
        </div>
        <div className="col-span-7">
          <h1 className="font-serif text-[44px] font-light leading-[1.02] tracking-[-0.02em] text-foreground">
            <EditableText
              {...fieldProps}
              path="stageName"
              value={current.stageName}
              className="editorial-italic"
              size="xl"
            />
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            <EditableText
              {...fieldProps}
              path="name"
              value={current.name}
              inline
            />
            {" · "}
            <EditableText
              {...fieldProps}
              path="talent"
              value={current.talent}
              inline
            />
            {" · "}
            <EditableSelect
              {...fieldProps}
              path="category"
              value={current.category}
              options={CATEGORY_OPTIONS}
            />
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              <EditableText
                {...fieldProps}
                path="location"
                value={current.location}
                inline
              />
            </span>
            <span>
              Joined{" "}
              <EditableText
                {...fieldProps}
                path="joinDate"
                value={current.joinDate}
                inline
                inputType="date"
                display={fmtDate(current.joinDate)}
              />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AtSign className="h-3 w-3" />
              <EditableText
                {...fieldProps}
                path="instagram"
                value={current.instagram}
                inline
              />
            </span>
          </div>
        </div>
        <div className="col-span-3 text-right">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Status
          </div>
          <div
            className={`mt-1 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] ${
              current.status === "Active"
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-muted-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                current.status === "Active"
                  ? "bg-emerald-500"
                  : "bg-muted-foreground"
              }`}
            />
            <EditableSelect
              {...fieldProps}
              path="status"
              value={current.status}
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Board
          </div>
          <div className="mt-1 text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            <EditableSelect
              {...fieldProps}
              path="board"
              value={current.board}
              options={BOARD_OPTIONS}
            />
          </div>
          <div className="mt-4 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Onboarding
          </div>
          <div className="mt-1.5 flex items-center justify-end gap-1">
            {onboardingSteps.map((_, i) => {
              const filled = i < current.onboardingStep;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!editing}
                  onClick={() => patch("onboardingStep", i + 1)}
                  className={`h-1.5 w-1.5 rounded-full transition-transform ${
                    filled ? "bg-foreground" : "bg-border"
                  } ${editing ? "hover:scale-150 cursor-pointer" : ""}`}
                />
              );
            })}
            <span className="ml-2 font-mono text-[10.5px] text-muted-foreground">
              {current.onboardingStep}/{onboardingSteps.length}
            </span>
          </div>
          <div className="mt-1 text-[10.5px] text-muted-foreground/70">
            {onboardingSteps[current.onboardingStep - 1] || "Not started"}
          </div>
        </div>
      </div>

      <section className="mt-10 grid grid-cols-1 gap-10 border-b border-border/60 pb-10 md:grid-cols-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Contact
          </div>
          <ul className="mt-3 space-y-2 text-[12.5px]">
            <li className="flex items-center gap-2 text-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <EditableText
                {...fieldProps}
                path="email"
                value={current.email}
                inline
              />
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <EditableText
                {...fieldProps}
                path="phone"
                value={current.phone}
                inline
              />
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <AtSign className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <EditableText
                {...fieldProps}
                path="instagram"
                value={current.instagram}
                inline
              />
            </li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Contract
          </div>
          <div className="mt-3 space-y-2 text-[12.5px]">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-muted-foreground">Type</span>
              <span className="text-foreground">
                <EditableSelect
                  {...fieldProps}
                  path="contractType"
                  value={current.contractType}
                  options={CONTRACT_TYPES}
                />
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-muted-foreground">Start</span>
              <span className="font-mono text-[11px] text-foreground">
                <EditableText
                  {...fieldProps}
                  path="contractStart"
                  value={current.contractStart}
                  inline
                  inputType="date"
                  display={shortDate(current.contractStart)}
                />
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-muted-foreground">End</span>
              <span className="font-mono text-[11px] text-foreground">
                <EditableText
                  {...fieldProps}
                  path="contractEnd"
                  value={current.contractEnd}
                  inline
                  inputType="date"
                  display={shortDate(current.contractEnd)}
                />
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-muted-foreground">Commission</span>
              <span className="font-serif text-[18px] font-light text-foreground">
                <EditableText
                  {...fieldProps}
                  path="commissionRate"
                  value={String(current.commissionRate)}
                  inline
                  inputType="number"
                  transform={(v) => Number(v)}
                />
                %
              </span>
            </div>
            {!editing && daysToContractEnd <= 60 && daysToContractEnd > 0 && (
              <div className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.14em] text-rose-700 dark:text-rose-400">
                <Clock className="h-3 w-3" />
                Renews in {daysToContractEnd}d
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Portfolio
          </div>
          <div className="mt-3 space-y-2 text-[12.5px]">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-muted-foreground">Comp card</span>
              <span className={portfolioTone(current.portfolioStatus.compCard)}>
                <EditableSelect
                  {...fieldProps}
                  path="portfolioStatus.compCard"
                  value={current.portfolioStatus.compCard}
                  options={PORTFOLIO_STATUSES}
                />
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-muted-foreground">Digitals</span>
              <span className={portfolioTone(current.portfolioStatus.digitals)}>
                <EditableSelect
                  {...fieldProps}
                  path="portfolioStatus.digitals"
                  value={current.portfolioStatus.digitals}
                  options={PORTFOLIO_STATUSES}
                />
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-muted-foreground">Images</span>
              <span className="font-serif text-[18px] font-light text-foreground">
                <EditableText
                  {...fieldProps}
                  path="portfolioStatus.imageCount"
                  value={String(current.portfolioStatus.imageCount)}
                  inline
                  inputType="number"
                  transform={(v) => Number(v)}
                />
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-muted-foreground">Next shoot</span>
              <span className="font-mono text-[11px] text-foreground">
                <EditableText
                  {...fieldProps}
                  path="portfolioStatus.nextScheduledShoot"
                  value={current.portfolioStatus.nextScheduledShoot || ""}
                  inline
                  inputType="date"
                  display={
                    current.portfolioStatus.nextScheduledShoot
                      ? shortDate(current.portfolioStatus.nextScheduledShoot)
                      : "—"
                  }
                />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 border-b border-border/60 pb-10">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Measurements
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            Card · physical
          </span>
        </div>
        <ol className="divide-y divide-border/60 border-y border-border/60">
          {measurementEntries.map(([label, path, value], i) => (
            <li key={label} className="py-2.5">
              <div className="grid grid-cols-12 items-baseline gap-x-4">
                <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-5 text-[12.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  {label}
                </div>
                <div className="col-span-6 text-right font-serif text-[17px] font-light text-foreground">
                  <EditableText
                    {...fieldProps}
                    path={path}
                    value={value}
                    inline
                    align="right"
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Bookings
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {talentBookings.length} on record · view only
          </span>
        </div>
        {talentBookings.length === 0 ? (
          <p className="py-6 text-[12px] text-muted-foreground">
            No bookings yet.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {talentBookings.map((b, i) => (
              <li key={b.id} className="py-4">
                <div className="grid grid-cols-12 items-baseline gap-x-4">
                  <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                    №{String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="col-span-2 font-mono text-[11px] text-foreground">
                    {shortDate(b.date)}
                  </div>
                  <div className="col-span-5 min-w-0">
                    <h3 className="truncate font-serif text-[17px] font-light text-foreground">
                      {b.client}
                    </h3>
                    <div className="mt-0.5 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground/80">
                      {b.type}
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-serif text-[16px] font-light text-foreground">
                    {b.value}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {b.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Payments
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {talentInvoices.length} invoices
          </span>
        </div>
        {talentInvoices.length === 0 ? (
          <p className="py-6 text-[12px] text-muted-foreground">
            No payments recorded.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {talentInvoices.map((inv) => (
              <li key={inv.id} className="py-4">
                <div className="grid grid-cols-12 items-baseline gap-x-4">
                  <div className="col-span-2 font-mono text-[11px] text-muted-foreground/80">
                    {inv.id}
                  </div>
                  <div className="col-span-4 font-serif text-[17px] font-light text-foreground">
                    {inv.client}
                  </div>
                  <div className="col-span-2 text-right font-mono text-[12px] text-foreground">
                    {inv.amount}
                  </div>
                  <div className="col-span-2 text-right font-mono text-[12px] text-emerald-700 dark:text-emerald-400">
                    {inv.commission}
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      className={`text-[10px] uppercase tracking-[0.14em] ${
                        inv.status === "Paid"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : inv.status === "Overdue"
                          ? "text-rose-700 dark:text-rose-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Documents
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {talentDocs.length} on file
          </span>
        </div>
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {talentDocs.map((d) => (
            <li key={d.id} className="py-3">
              <div className="grid grid-cols-12 items-baseline gap-x-4">
                <div className="col-span-6 min-w-0">
                  <div className="truncate font-serif text-[15px] font-light text-foreground">
                    {d.title}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground/70">
                    {d.fileName}
                  </div>
                </div>
                <div className="col-span-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  {d.type}
                </div>
                <div className="col-span-2 text-right font-mono text-[11px] text-muted-foreground">
                  {shortDate(d.uploadedAt)}
                </div>
                <div className="col-span-2 text-right">
                  {d.dateSigned ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
                      <Check className="h-3 w-3" /> Signed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            On the wire
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            Last {Math.min(5, talentNotifications.length)} threads
          </span>
        </div>
        {talentNotifications.length === 0 ? (
          <p className="py-6 text-[12px] text-muted-foreground">
            No messages yet.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {talentNotifications.slice(0, 5).map((n) => {
              const response = n.responses.find((r) => r.talentId === id);
              return (
                <li key={n.id} className="py-4">
                  <div className="grid grid-cols-12 items-baseline gap-x-4">
                    <div className="col-span-7 min-w-0">
                      <h4 className="truncate font-serif text-[15px] font-light text-foreground">
                        {n.title}
                      </h4>
                      <p className="mt-0.5 line-clamp-1 text-[11.5px] text-muted-foreground">
                        {n.body}
                      </p>
                    </div>
                    <div className="col-span-3 text-right font-mono text-[10.5px] text-muted-foreground">
                      {shortDate(n.sentAt.slice(0, 10))}
                    </div>
                    <div className="col-span-2 text-right">
                      {response ? (
                        <span className="text-[10.5px] uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
                          {response.response}
                        </span>
                      ) : (
                        <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function EditableText({
  editing,
  patch,
  path,
  value,
  inline,
  size,
  className = "",
  inputType = "text",
  display,
  align,
  transform,
}) {
  if (!editing) {
    if (inline) return <span className={className}>{display || value || "—"}</span>;
    return <span className={className}>{display || value}</span>;
  }
  const sizeClass =
    size === "xl"
      ? "text-[44px] font-light leading-[1.02] tracking-[-0.02em]"
      : "";
  return (
    <input
      type={inputType}
      value={value || ""}
      onChange={(e) =>
        patch(path, transform ? transform(e.target.value) : e.target.value)
      }
      className={`rounded-sm border border-dashed border-border bg-card/60 px-1 py-0.5 focus:border-foreground focus:outline-none ${sizeClass} ${
        align === "right" ? "text-right" : ""
      } ${className}`}
    />
  );
}

function EditableSelect({ editing, patch, path, value, options }) {
  if (!editing) return <span>{value}</span>;
  return (
    <select
      value={value}
      onChange={(e) => patch(path, e.target.value)}
      className="rounded-sm border border-dashed border-border bg-card/60 px-1 py-0.5 focus:border-foreground focus:outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
