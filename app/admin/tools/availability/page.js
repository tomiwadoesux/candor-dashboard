import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { checkAvailability } from "@/lib/queries/availability";
import { dateShort, statusLabel } from "@/lib/format";
import { PageIntro, Stat, StatusPill } from "@/components/admin/kit";
import { Field, inputClass } from "@/components/admin/form-kit";

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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isoDay(date) {
  return date.toISOString().slice(0, 10);
}

function conflictDates(c) {
  const start = dateShort(c.booking_date);
  const end = c.booking_end_date ? dateShort(c.booking_end_date) : null;
  return end && end !== start ? `${start} – ${end}` : start;
}

function TalentRow({ talent, conflictAccent }) {
  return (
    <li className="flex items-start gap-4 py-3.5">
      {talent.polaroid_url ? (
        <Image
          src={talent.polaroid_url}
          alt=""
          width={40}
          height={40}
          unoptimized
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border/60"
        />
      ) : (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted/60 text-[13.5px] font-medium text-foreground ring-1 ring-border/60">
          {talent.first_name?.[0]}
          {talent.last_name?.[0]}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Link
            href={`/admin/talent/${talent.id}`}
            className="text-[13px] font-medium text-foreground hover:underline"
          >
            {talent.first_name} {talent.last_name}
          </Link>
          <span className="text-[11px] text-muted-foreground">
            {statusLabel(talent.category)} · {statusLabel(talent.primary_location)}
          </span>
        </div>
        {talent.conflicts.length > 0 && (
          <ul className="mt-1.5 space-y-1">
            {talent.conflicts.map((c, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-muted-foreground"
              >
                <StatusPill status={c.status} accent={conflictAccent(c.status)} />
                <span className="truncate text-foreground/80">{c.project_title}</span>
                <span>{conflictDates(c)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function Group({ eyebrow, accent, dot, talent, empty, conflictAccent }) {
  return (
    <section>
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span
          className={`text-[11.5px] font-medium ${accent}`}
        >
          {eyebrow}
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          {talent.length}
        </span>
      </div>
      {talent.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-muted-foreground">{empty}</p>
      ) : (
        <ul className="stagger-in divide-y divide-border/40">
          {talent.map((t) => (
            <TalentRow key={t.id} talent={t} conflictAccent={conflictAccent} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AvailabilityPage({ searchParams }) {
  await requireRole("booker", "md", "ceo");
  const params = await searchParams;

  const today = new Date();
  const defaultFrom = isoDay(today);
  const defaultTo = isoDay(new Date(today.getTime() + 7 * 86400000));

  let from = typeof params.from === "string" && ISO_DATE.test(params.from) ? params.from : defaultFrom;
  let to = typeof params.to === "string" && ISO_DATE.test(params.to) ? params.to : defaultTo;
  if (to < from) [from, to] = [to, from];
  const category =
    typeof params.category === "string" && CATEGORIES.includes(params.category)
      ? params.category
      : "";

  const rows = await checkAvailability({ from, to, category: category || undefined });
  const available = rows.filter((r) => r.state === "available");
  const pencilled = rows.filter((r) => r.state === "pencilled");
  const booked = rows.filter((r) => r.state === "booked");

  const conflictAccent = (status) => (status === "confirmed" ? "destructive" : "warning");

  return (
    <div>
      <Link
        href="/admin/tools"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to tools
      </Link>

      <div className="mt-6">
        <PageIntro
          eyebrow="Tools · Scheduling"
          meta={`${dateShort(from)} – ${dateShort(to)}`}
          title={
            <>
              Availability radar
            </>
          }
          lede="Who is free, pencilled or booked in a date window — pending and confirmed bookings count as holds."
        />
      </div>

      <form
        action="/admin/tools/availability"
        className="mt-8 flex max-w-3xl flex-wrap items-end gap-4"
      >
        <Field label="From" className="w-40">
          <input type="date" name="from" defaultValue={from} required className={inputClass} />
        </Field>
        <Field label="To" className="w-40">
          <input type="date" name="to" defaultValue={to} required className={inputClass} />
        </Field>
        <Field label="Category" className="w-48">
          <select name="category" defaultValue={category} className={inputClass}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {statusLabel(c)}
              </option>
            ))}
          </select>
        </Field>
        <button
          type="submit"
          className="pressable inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-[12.5px] font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          <Search className="h-3.5 w-3.5" />
          Scan
        </button>
      </form>

      <div className="mt-10 grid grid-cols-2 gap-6 border-y border-border/60 py-5 sm:grid-cols-3 lg:max-w-2xl">
        <Stat
          label="Available"
          value={available.length}
          sub={`of ${rows.length} active`}
          accent="success"
        />
        <Stat label="Pencilled" value={pencilled.length} accent="warning" />
        <Stat label="Booked" value={booked.length} accent="destructive" />
      </div>

      {rows.length === 0 ? (
        <p className="py-16 text-center text-[12.5px] text-muted-foreground">
          No active talent {category ? `in ${statusLabel(category)}` : "on the roster"} —
          adjust the filters and scan again.
        </p>
      ) : (
        <div className="mt-10 space-y-10">
          <Group
            eyebrow="Available"
            accent="text-success"
            dot="bg-success"
            talent={available}
            empty="No one is fully free in this window."
            conflictAccent={conflictAccent}
          />
          <Group
            eyebrow="Pencilled · soft hold"
            accent="text-warning"
            dot="bg-warning"
            talent={pencilled}
            empty="No soft holds in this window."
            conflictAccent={conflictAccent}
          />
          <Group
            eyebrow="Booked"
            accent="text-destructive"
            dot="bg-destructive"
            talent={booked}
            empty="No confirmed bookings in this window."
            conflictAccent={conflictAccent}
          />
        </div>
      )}
    </div>
  );
}
