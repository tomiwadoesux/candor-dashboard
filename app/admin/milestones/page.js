import { MilestonesApproval } from "@/components/admin/milestones-approval";
import { milestones, talent } from "@/lib/data";

function fmtDate(s) {
  const d = new Date(s);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MilestonesAdminPage() {
  const pending = milestones.filter((m) => !m.approved);
  const approved = milestones
    .filter((m) => m.approved)
    .sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt));

  const talentById = {};
  talent.forEach((t) => {
    talentById[t.id] = t;
  });

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Operations · Milestones
        </div>
        <div className="text-[11px] text-muted-foreground">
          {milestones.length} celebrated
        </div>
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        Milestones <span className="editorial-italic">&amp; moments</span>
      </h1>
      <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
        When a talent lands a job worth shouting about, a draft lands here.
        Approve it, tweak the copy, or keep it anonymous — then it goes live to
        the roster&rsquo;s feed.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-3">
        <Stat label="Total" value={milestones.length} sub="All drafts & posts" />
        <Stat
          label="Awaiting review"
          value={pending.length}
          sub={pending.length > 0 ? "Queue up top" : "All caught up"}
          accent={pending.length > 0 ? "amber" : null}
        />
        <Stat
          label="Published"
          value={approved.length}
          sub="Live on the feed"
          accent="emerald"
        />
      </div>

      {pending.length > 0 && (
        <div className="mt-10 rounded-sm border border-amber-500/30 bg-amber-500/[0.04] p-5">
          <div className="flex items-baseline justify-between pb-3">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
                Drafts to review
              </div>
              <p className="mt-1 max-w-[58ch] text-[11.5px] leading-relaxed text-muted-foreground">
                When a booking is confirmed, Candor auto-drafts a milestone post.
                Each sits here until an admin approves — then it publishes to the
                roster feed. Edit the copy, choose named or anonymous, or skip it.
              </p>
            </div>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground/70">
              {pending.length} awaiting you
            </span>
          </div>
          <MilestonesApproval pending={pending} talentById={talentById} />
        </div>
      )}

      <div className="mt-12">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Published
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {approved.length} posts
          </span>
        </div>
        {approved.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-muted-foreground">
            Nothing published yet.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {approved.map((m, i) => {
              const t = talentById[m.talentId];
              const named = m.visibility === "named";
              return (
                <li key={m.id} className="py-5">
                  <div className="grid grid-cols-12 items-start gap-x-4">
                    <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                      №{String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="col-span-2">
                      {named ? (
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-muted/60 font-serif text-[12px] font-light italic text-foreground ring-1 ring-border/60">
                            {t?.avatar || m.talentName.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-[12.5px] text-foreground">
                              {m.talentName}
                            </div>
                            <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                              Named
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-muted/60 font-serif text-[12px] font-light text-muted-foreground ring-1 ring-border/60">
                            —
                          </span>
                          <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                            Anonymous
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-span-7 min-w-0">
                      <blockquote className="border-l border-border/60 pl-4 font-serif text-[15px] font-light italic leading-relaxed text-foreground">
                        &ldquo;{m.displayText}&rdquo;
                      </blockquote>
                      <div className="mt-2 text-[10.5px] text-muted-foreground">
                        {m.bookingTitle}
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                        Published
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-foreground">
                        {fmtDate(m.approvedAt)}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Live
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  const color =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : accent === "amber"
      ? "text-amber-700 dark:text-amber-400"
      : "text-foreground";
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </div>
      <div
        className={`mt-2 font-serif text-[28px] font-light leading-none tracking-[-0.02em] ${color}`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
