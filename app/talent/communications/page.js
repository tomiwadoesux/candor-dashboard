import { myNotifications } from "@/lib/queries/notifications";
import { myMessages } from "@/lib/queries/messages";
import { ChatThread } from "@/components/talent/communications/chat";

export default async function CommunicationsPage() {
  const [notifications, messages] = await Promise.all([
    myNotifications(),
    myMessages(),
  ]);

  return (
    <div className="flex h-[calc(100dvh-120px)] min-h-[480px] flex-col pt-2">
      <ChatThread notifications={notifications} messages={messages} />
    </div>
  );
}
