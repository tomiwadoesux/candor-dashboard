import { Eye, Lock } from "lucide-react";
import { getMyTalentProfile } from "@/lib/queries/talent";
import { dateShort, statusLabel } from "@/lib/format";
import { assetTone } from "@/components/talent/status-tones";
import { PortfolioGallery } from "@/components/talent/portfolio/gallery";

function StatusDot({ status }) {
  const tone = assetTone(status).dot;
  return (
    <span className="relative inline-flex h-2 w-2">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${tone} opacity-60`}
      />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${tone}`} />
    </span>
  );
}

export default async function PortfolioPage() {
  const me = await getMyTalentProfile();

  if (!me) {
    return (
      <div className="pt-10 text-center">
        <p className="font-serif text-[18px] italic text-muted-foreground">
          We couldn&apos;t find your talent profile.
        </p>
        <p className="mt-1 text-[12.5px] text-muted-foreground/70">
          Email bookings@ and we&apos;ll get it sorted.
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

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2 pt-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Profile · Portfolio
        </div>
        <div className="text-[11px] text-muted-foreground">
          {statusLabel(me.primary_location)}
          {me.secondary_location ? ` · ${statusLabel(me.secondary_location)}` : ""}
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">{me.first_name}</span>
        <span className="ml-2 text-muted-foreground/50">·</span>
        <span className="ml-2 text-[18px] text-muted-foreground">
          {statusLabel(me.category)}
        </span>
      </h2>
      <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
        {me.first_name} {me.last_name}. Updates to your comp card, digitals and
        measurements are handled by your booker — email bookings@ when anything
        needs a refresh.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        <Lock className="h-3 w-3" /> View only · managed by Candor
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12">
        <section className="md:col-span-5">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
            <h3 className="font-serif text-[20px] font-light text-foreground">
              <span className="editorial-italic">Measurements</span>
            </h3>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground/70">
              On file
            </span>
          </div>
          {rows.length === 0 ? (
            <p className="mt-4 py-6 text-center text-[12.5px] italic text-muted-foreground">
              No measurements on file yet — your booker will add them.
            </p>
          ) : (
            <dl className="mt-4 divide-y divide-border/40">
              {rows.map((r, i) => (
                <div
                  key={r.label}
                  className="flex items-baseline justify-between py-3"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[9.5px] text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <dt className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
                      {r.label}
                    </dt>
                  </div>
                  <dd className="font-serif text-[17px] font-light text-foreground">
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section className="md:col-span-7">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
            <h3 className="font-serif text-[20px] font-light text-foreground">
              <span className="editorial-italic">Status</span>
            </h3>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground/70">
              {me.portfolioImages.length} image
              {me.portfolioImages.length === 1 ? "" : "s"} on file
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatusCard
              label="Comp card"
              status={me.comp_card_status}
              note="Front + back, agency-branded"
            />
            <StatusCard
              label="Digitals"
              status={me.digitals_status}
              note="Natural light · three angles"
            />
            <StatusCard
              label="Last test shoot"
              value={me.last_test_shoot ? "Logged" : "—"}
              note={me.last_test_shoot ? dateShort(me.last_test_shoot) : "None on record"}
              neutral
            />
            <StatusCard
              label="Next scheduled shoot"
              value={me.next_scheduled_shoot ? "Booked" : "—"}
              note={
                me.next_scheduled_shoot
                  ? dateShort(me.next_scheduled_shoot)
                  : "Nothing scheduled"
              }
              neutral
            />
          </div>

          {me.portfolio_notes && (
            <div className="mt-6 rounded-sm border border-border/60 bg-muted/30 p-4">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Booker note
              </div>
              <p className="mt-1.5 font-serif text-[14.5px] font-light italic leading-relaxed text-foreground">
                &ldquo;{me.portfolio_notes}&rdquo;
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="mt-14">
        <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
          <h3 className="font-serif text-[22px] font-light text-foreground">
            <span className="editorial-italic">Selected work</span>
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            Tap any polaroid to view
          </div>
        </div>
        <div className="mt-8">
          {me.portfolioImages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface-muted/40 p-12 text-center">
              <p className="font-serif text-[18px] italic text-foreground/90">
                No images on file yet.
              </p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Your digitals and tearsheets will appear here after your first
                test shoot.
              </p>
            </div>
          ) : (
            <PortfolioGallery
              images={me.portfolioImages}
              name={me.first_name}
            />
          )}
        </div>
      </div>

      <div className="mt-14 rounded-sm border border-border/60 bg-muted/30 p-5">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Something out of date?
        </div>
        <p className="mt-1.5 font-serif text-[14px] font-light italic leading-relaxed text-foreground">
          Email bookings@ for updates to your measurements, comp card or
          digitals — we handle the rest.
        </p>
      </div>
    </div>
  );
}

function StatusCard({ label, status, value, note, neutral }) {
  const tone = neutral ? null : assetTone(status);
  return (
    <div className="rounded-sm border border-border/60 bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        {!neutral && <StatusDot status={status} />}
      </div>
      <div
        className={`mt-2 font-serif text-[18px] font-light ${
          tone ? tone.text : "text-foreground"
        }`}
      >
        {neutral ? value : statusLabel(status || "missing")}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{note}</div>
    </div>
  );
}
