import { Check, Lock } from "lucide-react";
import { getMyTalentProfile } from "@/lib/queries/talent";
import { dateShort, statusLabel } from "@/lib/format";
import { assetTone } from "@/components/talent/status-tones";
import { PortfolioGallery } from "@/components/talent/portfolio/gallery";
import { PageHeader, SectionHead, ToneChip } from "@/components/talent/kit";

export default async function PortfolioPage() {
  const me = await getMyTalentProfile();

  if (!me) {
    return (
      <div className="pt-16 text-center">
        <p className="text-[14px] font-medium text-foreground">
          We couldn&apos;t find your talent profile
        </p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Email bookings@candormanagement.com and we&apos;ll get it sorted.
        </p>
      </div>
    );
  }

  const m = me.measurements;
  const rows = m
    ? [
        { label: "Height", value: m.height_display || (m.height_cm ? `${m.height_cm} cm` : null) },
        { label: "Bust", value: m.bust },
        { label: "Waist", value: m.waist },
        { label: "Hips", value: m.hips },
        { label: "Shoes (UK)", value: m.shoe_uk },
        { label: "Dress size", value: m.dress_size },
        { label: "Hair", value: m.hair_colour },
        { label: "Eyes", value: m.eye_colour },
      ].filter((r) => r.value)
    : [];

  // Booking-readiness: the things bookers check before pitching you.
  const health = [
    { label: "Comp card current", ok: me.comp_card_status === "current" },
    { label: "Digitals current", ok: me.digitals_status === "current" },
    { label: "Measurements on file", ok: rows.length >= 4 },
    { label: "Portfolio images", ok: me.portfolioImages.length > 0 },
    { label: "Bio written", ok: Boolean(me.bio) },
    { label: "Instagram linked", ok: Boolean(me.instagram_handle) },
  ];
  const done = health.filter((h) => h.ok).length;
  const pct = Math.round((done / health.length) * 100);

  return (
    <div>
      <PageHeader
        title={`${me.first_name} ${me.last_name}`}
        meta={[
          statusLabel(me.category),
          statusLabel(me.primary_location),
          me.secondary_location ? statusLabel(me.secondary_location) : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground">
            <Lock className="h-3 w-3" />
            Managed by Candor
          </span>
        }
      />

      {/* Booking readiness */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[13.5px] font-semibold text-foreground">
              {pct === 100 ? "Booking-ready" : "Booking readiness"}
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {pct === 100
                ? "Everything bookers check is up to date."
                : "What bookers check before pitching you to clients."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-36 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-500 ease-[var(--ease-out)]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span data-slot="numeric" className="text-[13px] font-medium text-foreground">
              {pct}%
            </span>
          </div>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-3">
          {health.map((h) => (
            <li key={h.label} className="flex items-center gap-2 text-[12.5px]">
              <span
                className={`grid h-4 w-4 place-items-center rounded-full ${
                  h.ok ? "bg-success/15 text-success" : "bg-muted text-muted-foreground/50"
                }`}
              >
                <Check className="h-2.5 w-2.5" />
              </span>
              <span className={h.ok ? "text-foreground" : "text-muted-foreground"}>
                {h.label}
              </span>
            </li>
          ))}
        </ul>
        {pct < 100 && (
          <p className="mt-3 text-[12px] text-muted-foreground">
            Email bookings@candormanagement.com to update anything — your booker
            handles the rest.
          </p>
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12">
        <section className="md:col-span-5">
          <SectionHead title="Measurements" className="border-b border-border pb-2.5" />
          {rows.length === 0 ? (
            <p className="py-8 text-center text-[12.5px] text-muted-foreground">
              No measurements on file yet — your booker will add them.
            </p>
          ) : (
            <dl className="divide-y divide-border/50">
              {rows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between py-2.5">
                  <dt className="text-[12.5px] text-muted-foreground">{r.label}</dt>
                  <dd className="text-[13.5px] font-medium text-foreground">{r.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {m?.updated_at && rows.length > 0 && (
            <p className="mt-3 text-[11.5px] text-muted-foreground/70">
              Last updated {dateShort(m.updated_at)}
            </p>
          )}
        </section>

        <section className="md:col-span-7">
          <SectionHead
            title="Portfolio status"
            meta={`${me.portfolioImages.length} image${me.portfolioImages.length === 1 ? "" : "s"}`}
            className="border-b border-border pb-2.5"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatusCard label="Comp card" status={me.comp_card_status} />
            <StatusCard label="Digitals" status={me.digitals_status} />
            <StatusCard
              label="Last test shoot"
              plain={me.last_test_shoot ? dateShort(me.last_test_shoot) : "None on record"}
            />
            <StatusCard
              label="Next shoot"
              plain={
                me.next_scheduled_shoot
                  ? dateShort(me.next_scheduled_shoot)
                  : "Nothing scheduled"
              }
            />
          </div>

          {me.portfolio_notes && (
            <div className="mt-4 rounded-xl border border-border bg-surface-muted/50 p-4">
              <div className="text-[11.5px] font-medium text-muted-foreground">
                Booker note
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-foreground/90">
                {me.portfolio_notes}
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="mt-12">
        <SectionHead
          title="Selected work"
          className="border-b border-border pb-2.5"
        />
        <div className="mt-6">
          {me.portfolioImages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface-muted/40 p-10 text-center">
              <p className="text-[14px] font-medium text-foreground">
                No images on file yet
              </p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Your digitals and tearsheets appear here after your first test shoot.
              </p>
            </div>
          ) : (
            <PortfolioGallery images={me.portfolioImages} name={me.first_name} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, status, plain }) {
  const tone = status ? assetTone(status) : null;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[11.5px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-1.5">
        {tone ? (
          <ToneChip status={status || "missing"} tone={tone} className="text-[13px]" />
        ) : (
          <span className="text-[13px] font-medium text-foreground">{plain}</span>
        )}
      </div>
    </div>
  );
}
