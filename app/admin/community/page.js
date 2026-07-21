import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clapperboard, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { publishedMilestones } from "@/lib/queries/milestones";
import { listCastings } from "@/lib/queries/castings";
import { dateShort, relativeTime, statusLabel } from "@/lib/format";
import { PageIntro, Stat } from "@/components/admin/kit";

export default async function AdminCommunityPage() {
  await requireRole("booker", "md", "ceo");
  const [milestones, openCastings] = await Promise.all([
    publishedMilestones(),
    listCastings({ status: "open" }),
  ]);

  const named = milestones.filter((m) => m.visibility === "named").length;

  return (
    <div>
      <PageIntro
        eyebrow="Operations · Community feed"
        meta="What the roster sees on their dashboards"
        title={
          <>
            The wire
          </>
        }
        lede="The talent-facing community feed as it stands: published milestones and open castings. Milestones are approved on the Milestones page; castings are posted from the casting board."
      />

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat label="Live milestones" value={milestones.length} sub="On the feed" accent="success" />
        <Stat label="Named" value={named} sub={`${milestones.length - named} anonymous`} />
        <Stat
          label="Open castings"
          value={openCastings.length}
          sub="Accepting interest"
          accent="brand"
        />
        <Stat
          label="Interest raised"
          value={openCastings.reduce((s, c) => s + (c.interestedCount || 0), 0)}
          sub="Across open briefs"
        />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
            <h2 className="text-[15px] font-semibold text-foreground">
              Milestones · live
            </h2>
            <Link
              href="/admin/milestones"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Review queue <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border/60">
            {milestones.length === 0 && (
              <li className="py-10 text-center text-[12px] text-muted-foreground">
                Nothing on the feed yet — approve a milestone to light it up.
              </li>
            )}
            {milestones.map((m) => {
              const t = m.visibility === "named" ? m.talent : null;
              return (
                <li key={m.id} className="flex items-start gap-4 py-5">
                  {t?.polaroid_url ? (
                    <Image
                      src={t.polaroid_url}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized
                      className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border/60"
                    />
                  ) : (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted/60 text-brand ring-1 ring-border/60">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <blockquote className="text-[13.5px] font-medium leading-relaxed text-foreground">
                      &ldquo;{m.display_text}&rdquo;
                    </blockquote>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[10.5px] text-muted-foreground">
                      <span>
                        {t ? `${t.first_name} ${t.last_name}` : "One of the roster"}
                      </span>
                      <span>·</span>
                      <span className="font-mono">{relativeTime(m.created_at)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="lg:col-span-5">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
            <h2 className="text-[15px] font-semibold text-foreground">
              Open castings
            </h2>
            <Link
              href="/admin/casting"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Board <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border/60">
            {openCastings.length === 0 && (
              <li className="py-10 text-center text-[12px] text-muted-foreground">
                No open castings —{" "}
                <Link
                  href="/admin/casting/new"
                  className="underline transition-colors hover:text-foreground"
                >
                  post a brief
                </Link>
                .
              </li>
            )}
            {openCastings.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/casting/${c.id}`}
                  className="group flex items-start gap-3 py-4 transition-colors hover:bg-muted/30"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted/60 text-muted-foreground ring-1 ring-border/60">
                    <Clapperboard className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-foreground">
                      {c.title}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10.5px] text-muted-foreground">
                      <span className="">
                        {statusLabel(c.category)}
                      </span>
                      <span>·</span>
                      <span>{statusLabel(c.location)}</span>
                      <span>·</span>
                      <span>Closes {dateShort(c.deadline)}</span>
                    </div>
                  </div>
                  <span
                    data-slot="numeric"
                    className="shrink-0 text-[13.5px] font-medium text-foreground"
                  >
                    {c.interestedCount ?? 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
