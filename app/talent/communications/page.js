import { myNotifications } from "@/lib/queries/notifications";
import { ChatThread } from "@/components/talent/communications/chat";

export default async function CommunicationsPage() {
  const notifications = await myNotifications();

  return (
    <div className="flex h-[calc(100dvh-120px)] min-h-[480px] flex-col pt-2">
      <ChatThread notifications={notifications} />
    </div>
  );
}
