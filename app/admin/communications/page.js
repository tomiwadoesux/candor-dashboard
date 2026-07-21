import { requireRole } from "@/lib/auth";
import { listNotifications } from "@/lib/queries/notifications";
import { listTalent } from "@/lib/queries/talent";
import { AdminMessenger } from "@/components/admin/messenger";

export default async function CommunicationsAdminPage() {
  await requireRole("booker", "md", "ceo");

  const [notifications, talent] = await Promise.all([
    listNotifications({ tab: "all" }),
    listTalent({ status: "active" }),
  ]);

  return (
    <div className="flex h-[calc(100dvh-120px)] min-h-[520px] flex-col">
      <div className="pb-4">
        <h1 className="text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
          Messages
        </h1>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Conversations with the roster — replies, availability checks and
          broadcasts in one place.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <AdminMessenger
          notifications={notifications}
          talent={talent.map((t) => ({
            id: t.id,
            name: `${t.first_name} ${t.last_name}`,
          }))}
        />
      </div>
    </div>
  );
}
