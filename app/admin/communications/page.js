import { CommunicationsLog } from "@/components/admin/communications-log";
import { notifications, talent } from "@/lib/data";

export default function CommunicationsAdminPage() {
  const total = notifications.length;
  const escalated = notifications.filter((n) => n.escalated).length;
  const pendingResponses = notifications.reduce((sum, n) => {
    return sum + (n.recipientIds.length - n.responses.length);
  }, 0);
  const totalRecipients = notifications.reduce(
    (s, n) => s + n.recipientIds.length,
    0
  );
  const totalResponses = notifications.reduce(
    (s, n) => s + n.responses.length,
    0
  );
  const responseRate = totalRecipients
    ? Math.round((totalResponses / totalRecipients) * 100)
    : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Operations · Communications
        </div>
        <div className="text-[11px] text-muted-foreground">
          {total} on the wire
        </div>
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Wire</span>
      </h1>
      <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
        Every message the agency sends out — availability checks, briefs, pay
        updates. Replies land here first. Escalated threads surface at the top
        of the queue.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat label="Sent" value={total} sub="This quarter" />
        <Stat
          label="Awaiting"
          value={pendingResponses}
          sub="No reply yet"
          accent={pendingResponses > 0 ? "amber" : null}
        />
        <Stat
          label="Escalated"
          value={escalated}
          sub={escalated > 0 ? "Needs a nudge" : "All quiet"}
          accent={escalated > 0 ? "rose" : null}
        />
        <Stat
          label="Response rate"
          value={`${responseRate}%`}
          sub="Across all threads"
          accent="emerald"
        />
      </div>

      <div className="mt-10">
        <CommunicationsLog notifications={notifications} talent={talent} />
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
      : accent === "rose"
      ? "text-rose-700 dark:text-rose-400"
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
