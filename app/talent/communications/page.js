import { myNotifications } from "@/lib/queries/notifications";
import { NotificationInbox } from "@/components/talent/communications/inbox";

export default async function CommunicationsPage() {
  const notifications = await myNotifications();
  const awaiting = notifications.filter(
    (n) => n.requiresResponse && n.responseStatus === "pending"
  ).length;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2 pt-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Dashboard · Communications
        </div>
        <div className="text-[11px] text-muted-foreground">
          {awaiting > 0
            ? `${awaiting} awaiting your response`
            : "All caught up"}
        </div>
      </div>
      <h1 className="font-serif text-[38px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Communications</span>
      </h1>
      <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
        Messages from the Candor office — availability checks, booking updates,
        briefs and announcements. Respond where a response is needed.
      </p>

      <div className="mt-8">
        <NotificationInbox notifications={notifications} />
      </div>

      <div className="mt-20 border-t border-border pt-6">
        <p className="font-serif text-[12.5px] italic text-muted-foreground">
          Candor Management Agency · Lagos · London · USA
        </p>
      </div>
    </div>
  );
}
