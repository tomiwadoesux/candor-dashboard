// Server component — filters and search are searchParams-driven.

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Search } from "lucide-react";
import { dateShort, statusLabel } from "@/lib/format";
import { StatusPill, EmptyRow } from "@/components/admin/kit";

const STATUS_FILTERS = [
  { id: "", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "suspended", label: "Suspended" },
  { id: "exited", label: "Exited" },
];

const CATEGORIES = [
  "model",
  "photographer",
  "creative_director",
  "visual_artist",
  "artisan",
  "graphic_designer",
  "content_creator",
  "influencer",
  "brand_partner",
  "educator",
];

function talentAccent(status) {
  if (status === "active") return "success";
  if (status === "suspended") return "warning";
  if (status === "exited") return "destructive";
  return "muted";
}

function filterHref({ q, status, category }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (category) params.set("category", category);
  const s = params.toString();
  return `/admin/talent${s ? `?${s}` : ""}`;
}

export function TalentRoster({ talent, q = "", status = "", category = "" }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const active = status === f.id;
            return (
              <Link
                key={f.id || "all"}
                href={filterHref({ q, status: f.id, category })}
                className={`pressable inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <form
          action="/admin/talent"
          className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground focus-within:border-foreground/50"
        >
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="h-3 w-3" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search first or last name"
            className="w-44 bg-transparent text-[11.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <select
            name="category"
            defaultValue={category}
            className="bg-transparent text-[11px] text-muted-foreground focus:outline-none"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {statusLabel(c)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="pressable text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
          >
            Go
          </button>
        </form>
      </div>

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {talent.map((t, i) => (
          <li key={t.id}>
            <Link
              href={`/admin/talent/${t.id}`}
              className="group grid grid-cols-12 items-center gap-x-4 gap-y-2 py-4 transition-colors hover:bg-muted/30"
            >
              <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                №{String(i + 1).padStart(3, "0")}
              </div>
              <div className="col-span-5 flex min-w-0 items-center gap-4">
                {t.polaroid_url ? (
                  <Image
                    src={t.polaroid_url}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border/60"
                  />
                ) : (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted/60 font-serif text-[15px] font-light italic text-foreground ring-1 ring-border/60">
                    {t.first_name?.[0]}
                    {t.last_name?.[0]}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate font-serif text-[18px] font-light text-foreground">
                      {t.first_name} {t.last_name}
                    </span>
                    {t.instagram_handle && (
                      <span className="truncate text-[11px] text-muted-foreground">
                        @{t.instagram_handle.replace(/^@/, "")}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                    <span className="uppercase tracking-[0.1em]">
                      {statusLabel(t.category)}
                    </span>
                    <span>·</span>
                    <span>{statusLabel(t.primary_location)}</span>
                    {t.secondary_location && (
                      <>
                        <span>·</span>
                        <span>{statusLabel(t.secondary_location)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="text-[11px] text-muted-foreground">
                  {statusLabel(t.exclusivity)} · {statusLabel(t.contract_type)}
                </div>
                <div className="mt-0.5 text-[10.5px] text-muted-foreground/80">
                  {t.contract_end_date
                    ? `Contract ends ${dateShort(t.contract_end_date)}`
                    : "No contract end date"}
                </div>
              </div>
              <div className="col-span-2 text-right">
                <div
                  data-slot="numeric"
                  className="font-serif text-[22px] font-light leading-none text-foreground"
                >
                  {Number(t.commission_rate)}%
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  commission
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-end gap-2">
                <StatusPill status={t.status} accent={talentAccent(t.status)} />
                <ArrowUpRight className="h-3 w-3 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
            </Link>
          </li>
        ))}
        {talent.length === 0 && (
          <EmptyRow>
            No talent match — clear the filters or add the first profile.
          </EmptyRow>
        )}
      </ul>
    </>
  );
}
