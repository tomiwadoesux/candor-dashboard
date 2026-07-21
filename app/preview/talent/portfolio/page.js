import { Check, Lock } from "lucide-react";
import { preview } from "@/lib/preview/mock";
import { dateShort, statusLabel } from "@/lib/format";
import { assetTone } from "@/components/talent/status-tones";
import { PortfolioGallery } from "@/components/talent/portfolio/gallery";
import { PageHeader, SectionHead, ToneChip } from "@/components/talent/kit";
import { TalentFrame } from "@/components/preview/talent-frame";

function StatusCard({ label, status, plain }) {
  const tone = status ? assetTone(status) : null;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[11.5px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-1.5">
        {tone ? <ToneChip status={status || "missing"} tone={tone} className="text-[13px]" /> : <span className="text-[13px] font-medium text-foreground">{plain}</span>}
      </div>
    </div>
  );
}

export default function Page() {
  const me = preview.me;
  const m = me.measurements;
  const rows = [
    { label: "Height", value: m.height_display },
    { label: "Bust", value: m.bust },
    { label: "Waist", value: m.waist },
    { label: "Hips", value: m.hips },
    { label: "Shoes (UK)", value: m.shoe_uk },
    { label: "Dress size", value: m.dress_size },
    { label: "Hair", value: m.hair_colour },
    { label: "Eyes", value: m.eye_colour },
  ].filter((r) => r.value);

  const health = [
    { label: "Comp card current", ok: me.comp_card_status === "current" },
    { label: "Digitals current", ok: me.digitals_status === "current" },
    { label: "Measurements on file", ok: rows.length >= 4 },
    { label: "Portfolio images", ok: me.portfolio_images.length > 0 },
    { label: "Bio written", ok: Boolean(me.bio) },
    { label: "Instagram linked", ok: Boolean(me.instagram_handle) },
  ];
  const pct = Math.round((health.filter((h) => h.ok).length / health.length) * 100);

  return (
    <TalentFrame>
      <PageHeader
        title={`${me.first_name} ${me.last_name}`}
        meta={[statusLabel(me.category), statusLabel(me.primary_location)].filter(Boolean).join(" · ")}
        action={<span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground"><Lock className="h-3 w-3" />Managed by Candor</span>}
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[13.5px] font-semibold text-foreground">{pct === 100 ? "Booking-ready" : "Booking readiness"}</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">What bookers check before pitching you to clients.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-36 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
            </div>
            <span data-slot="numeric" className="text-[13px] font-medium text-foreground">{pct}%</span>
          </div>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-3">
          {health.map((h) => (
            <li key={h.label} className="flex items-center gap-2 text-[12.5px]">
              <span className={`grid h-4 w-4 place-items-center rounded-full ${h.ok ? "bg-success/15 text-success" : "bg-muted text-muted-foreground/50"}`}>
                <Check className="h-2.5 w-2.5" />
              </span>
              <span className={h.ok ? "text-foreground" : "text-muted-foreground"}>{h.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12">
        <section className="md:col-span-5">
          <SectionHead title="Measurements" className="border-b border-border pb-2.5" />
          <dl className="divide-y divide-border/50">
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between py-2.5">
                <dt className="text-[12.5px] text-muted-foreground">{r.label}</dt>
                <dd className="text-[13.5px] font-medium text-foreground">{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11.5px] text-muted-foreground/70">Last updated {dateShort(m.updated_at)}</p>
        </section>

        <section className="md:col-span-7">
          <SectionHead title="Portfolio status" meta={`${me.portfolio_images.length} images`} className="border-b border-border pb-2.5" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatusCard label="Comp card" status={me.comp_card_status} />
            <StatusCard label="Digitals" status={me.digitals_status} />
            <StatusCard label="Last test shoot" plain={dateShort(me.last_test_shoot)} />
            <StatusCard label="Next shoot" plain={me.next_scheduled_shoot ? dateShort(me.next_scheduled_shoot) : "Nothing scheduled"} />
          </div>
          {me.portfolio_notes && (
            <div className="mt-4 rounded-xl border border-border bg-surface-muted/50 p-4">
              <div className="text-[11.5px] font-medium text-muted-foreground">Booker note</div>
              <p className="mt-1 text-[13px] leading-relaxed text-foreground/90">{me.portfolio_notes}</p>
            </div>
          )}
        </section>
      </div>

      <div className="mt-12">
        <SectionHead title="Selected work" className="border-b border-border pb-2.5" />
        <div className="mt-6">
          <PortfolioGallery images={me.portfolio_images} name={me.first_name} />
        </div>
      </div>
    </TalentFrame>
  );
}
