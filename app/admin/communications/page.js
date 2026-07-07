import { requireRole } from "@/lib/auth";
import { listNotifications } from "@/lib/queries/notifications";
import { listTalent } from "@/lib/queries/talent";
import { PageIntro, Stat } from "@/components/admin/kit";
import { CommunicationsLog } from "@/components/admin/communications-log";
import { ComposeNotification } from "@/components/admin/compose-notification";

const TABS = ["all", "awaiting", "escalated"];

export default async function CommunicationsAdminPage({ searchParams }) {
  await requireRole("booker", "md", "ceo");
  const sp = await searchParams;
  const tab = TABS.includes(sp.tab) ? sp.tab : "all";

  const [notifications, talent] = await Promise.all([
    listNotifications({ tab }),
    listTalent({ status: "active" }),
  ]);

  // Direct notifications embed `talent`; broadcasts have it null and carry
  // per-recipient state in `recipients`.
  const isBroadcast = (n) => !n.talent && (n.recipients || []).length > 0;
  const escalated = notifications.filter((n) => n.escalated).length;
  const awaiting = notifications.filter(
    (n) =>
      n.requires_response &&
      (isBroadcast(n)
        ? (n.recipients || []).some((r) => r.response_status === "pending")
        : n.response_status === "pending")
  ).length;
  const broadcasts = notifications.filter(isBroadcast).length;

  return (
    <div>
      <PageIntro
        eyebrow="Operations · Communications"
        meta={`${notifications.length} on the wire`}
        title={<span className="editorial-italic">Wire</span>}
        lede="Every message the agency sends out — availability checks, briefs, pay updates. Replies land here first. Escalated threads surface at the top of the queue."
      />

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat label="In view" value={notifications.length} sub="Current tab" />
        <Stat
          label="Awaiting"
          value={awaiting}
          sub="No reply yet"
          accent={awaiting > 0 ? "warning" : null}
        />
        <Stat
          label="Escalated"
          value={escalated}
          sub={escalated > 0 ? "Needs a nudge" : "All quiet"}
          accent={escalated > 0 ? "destructive" : null}
        />
        <Stat label="Broadcasts" value={broadcasts} sub="Multi-recipient" accent="bronze" />
      </div>

      <div className="mt-10">
        <ComposeNotification
          talent={talent.map((t) => ({
            id: t.id,
            name: `${t.first_name} ${t.last_name}`,
          }))}
        />
      </div>

      <div className="mt-10">
        <CommunicationsLog notifications={notifications} tab={tab} />
      </div>
    </div>
  );
}
