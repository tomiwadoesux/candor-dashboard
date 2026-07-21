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
                className={`pressable inline-flex h-7 items-center rounded-full px-3 text-[12px] font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <form
          action="/admin/talent"
          className="ml-auto flex h-8 items-center gap-2 rounded-lg border border-input bg-surface px-2.5 text-[12px] text-muted-foreground transition-[border-color,box-shadow] duration-140 ease-[var(--ease-out)] focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-ring"
        >
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="h-3.5 w-3.5" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search names…"
            className="w-40 bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <select
            name="category"
            defaultValue={category}
            className="bg-transparent text-[12px] text-muted-foreground focus:outline-none"
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
            className="pressable text-[12px] font-medium text-brand hover:text-brand-hover"
          >
            Go
          </button>
        </form>
      </div>

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {talent.map((t) => (
          <li key={t.id}>
            <Link
              href={`/admin/talent/${t.id}`}
              className="group grid grid-cols-12 items-center gap-x-4 gap-y-2 px-2 py-3.5 transition-colors hover:bg-surface-muted/60"
            >
              <div className="col-span-6 flex min-w-0 items-center gap-3.5">
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
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted/60 text-[13.5px] font-medium text-foreground ring-1 ring-border/60">
                    {t.first_name?.[0]}
                    {t.last_name?.[0]}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-[13.5px] font-medium text-foreground">
                      {t.first_name} {t.last_name}
                    </span>
                    {t.instagram_handle && (
                      <span className="truncate text-[11px] text-muted-foreground">
                        @{t.instagram_handle.replace(/^@/, "")}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                    <span className="">
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
                <div className="text-[12px] text-muted-foreground">
                  {statusLabel(t.exclusivity)} · {statusLabel(t.contract_type)}
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground/70">
                  {t.contract_end_date
                    ? `Ends ${dateShort(t.contract_end_date)}`
                    : "Open-ended"}
                </div>
              </div>
              <div className="col-span-1 text-right">
                <span data-slot="numeric" className="text-[13px] font-medium text-foreground">
                  {Number(t.commission_rate)}%
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <StatusPill status={t.status} accent={talentAccent(t.status)} />
                <ArrowUpRight className="h-3 w-3 text-muted-foreground/40 transition-[transform,color] duration-200 ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
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
