import { PortfolioGallery } from "@/components/talent/portfolio/gallery";
import { talent } from "@/lib/data";
import { Eye, Lock } from "lucide-react";

const ME_ID = "1";

function StatusDot({ status }) {
  const tone =
    status === "Current"
      ? "bg-emerald-500"
      : status === "Needs Update"
      ? "bg-amber-500"
      : "bg-rose-500";
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${tone} opacity-60`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${tone}`} />
    </span>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PortfolioPage() {
  const me = talent.find((t) => t.id === ME_ID);
  const m = me.measurements;
  const p = me.portfolioStatus;

  const rows = [
    { label: "Height", value: me.height },
    { label: "Bust", value: m.bust },
    { label: "Waist", value: m.waist },
    { label: "Hips", value: m.hips },
    { label: "Shoes", value: m.shoeSize },
    { label: "Hair", value: m.hairColor },
    { label: "Eyes", value: m.eyeColor },
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Profile · Portfolio
        </div>
        <div className="text-[11px] text-muted-foreground">
          {me.board} · {me.location}
        </div>
      </div>
      <h2 className="font-serif text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">{me.stageName}</span>
        <span className="ml-2 text-muted-foreground/50">·</span>
        <span className="ml-2 text-[18px] text-muted-foreground">{me.category}</span>
      </h2>
      <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
        {me.name}. Updates to your comp card, digitals and measurements are
        handled by your booker — we&apos;ll flag here when anything needs a refresh.
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
        </section>

        <section className="md:col-span-7">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
            <h3 className="font-serif text-[20px] font-light text-foreground">
              <span className="editorial-italic">Status</span>
            </h3>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground/70">
              {p.imageCount} images on file
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatusCard label="Comp card" status={p.compCard} note="Front + back, agency-branded" />
            <StatusCard label="Digitals" status={p.digitals} note="Natural light · three angles" />
            <StatusCard
              label="Last test shoot"
              status="Logged"
              note={formatDate(p.lastTestShoot)}
              neutral
            />
            <StatusCard
              label="Next scheduled shoot"
              status="Booked"
              note={formatDate(p.nextScheduledShoot)}
              neutral
            />
          </div>

          <div className="mt-6 rounded-sm border border-border/60 bg-muted/30 p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Booker note
              </span>
              <span className="font-mono text-[9.5px] text-muted-foreground/60">
                · Tomi, 14 Apr
              </span>
            </div>
            <p className="mt-1.5 font-serif text-[14.5px] font-light italic leading-relaxed text-foreground">
              &ldquo;Digitals still current through end of April — we&apos;ll refresh
              before the Q2 push. Comp card approved by Adaora.&rdquo;
            </p>
          </div>
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
          <PortfolioGallery />
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, status, note, neutral }) {
  return (
    <div className="rounded-sm border border-border/60 bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        {!neutral && <StatusDot status={status} />}
      </div>
      <div className="mt-2 font-serif text-[18px] font-light text-foreground">
        {status}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{note}</div>
    </div>
  );
}
