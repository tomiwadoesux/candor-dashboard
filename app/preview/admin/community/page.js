import Link from "next/link";
import { ArrowUpRight, Clapperboard, Sparkles } from "lucide-react";
import { preview } from "@/lib/preview/mock";
import { dateShort, relativeTime, statusLabel } from "@/lib/format";
import { PageIntro, Stat } from "@/components/admin/kit";
import { AdminFrame } from "@/components/preview/admin-frame";

export default function Page() {
  const milestones = preview.publishedMilestones;
  const openCastings = preview.adminCastings.filter((c) => c.status === "open");
  const named = milestones.filter((m) => m.visibility === "named").length;

  return (
    <AdminFrame>
      <PageIntro
        eyebrow="Operations · Community feed"
        meta="What the roster sees on their dashboards"
        title={<>The wire</>}
        lede="The talent-facing community feed as it stands: published milestones and open castings."
      />
      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border py-5 md:grid-cols-4">
        <Stat label="Live milestones" value={milestones.length} sub="On the feed" accent="success" />
        <Stat label="Named" value={named} sub={`${milestones.length - named} anonymous`} />
        <Stat label="Open castings" value={openCastings.length} sub="Accepting interest" accent="brand" />
        <Stat label="Interest raised" value={openCastings.reduce((s, c) => s + (c.interestedCount || 0), 0)} sub="Across open briefs" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex items-baseline justify-between border-b border-border pb-2">
            <h2 className="text-[13px] font-medium text-foreground">Milestones · live</h2>
            <Link href="/preview/admin/milestones" className="inline-flex items-center gap-1 text-[11.5px] font-medium text-brand">Review queue <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <ul className="divide-y divide-border/60">
            {milestones.map((m) => {
              const t = m.visibility === "named" ? m.talent : null;
              return (
                <li key={m.id} className="flex items-start gap-4 py-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-soft-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <blockquote className="text-[13.5px] font-medium leading-relaxed text-foreground">&ldquo;{m.display_text}&rdquo;</blockquote>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">
                      <span>{t ? `${t.first_name} ${t.last_name}` : "One of the roster"}</span>
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
          <div className="flex items-baseline justify-between border-b border-border pb-2">
            <h2 className="text-[13px] font-medium text-foreground">Open castings</h2>
            <Link href="/preview/admin/casting" className="inline-flex items-center gap-1 text-[11.5px] font-medium text-brand">Board <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <ul className="divide-y divide-border/60">
            {openCastings.map((c) => (
              <li key={c.id}>
                <div className="group flex items-start gap-3 py-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-muted text-muted-foreground ring-1 ring-border">
                    <Clapperboard className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-foreground">{c.title}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                      <span>{statusLabel(c.category)}</span><span>·</span><span>{statusLabel(c.location)}</span><span>·</span><span>Closes {dateShort(c.deadline)}</span>
                    </div>
                  </div>
                  <span data-slot="numeric" className="shrink-0 text-[13.5px] font-medium text-foreground">{c.interestedCount ?? 0}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </AdminFrame>
  );
}
