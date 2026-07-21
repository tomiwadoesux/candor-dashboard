import { TalentFrame } from "@/components/preview/talent-frame";
import { preview } from "@/lib/preview/mock";
import { ChatThread } from "@/components/talent/communications/chat";

export default function Page() {
  return (
    <TalentFrame>
      <div className="flex h-[calc(100dvh-120px)] min-h-[480px] flex-col pt-2">
        <ChatThread notifications={preview.myNotifications} />
      </div>
    </TalentFrame>
  );
}
