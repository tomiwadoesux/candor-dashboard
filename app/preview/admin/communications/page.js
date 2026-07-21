import { preview } from "@/lib/preview/mock";
import { AdminMessenger } from "@/components/admin/messenger";
import { AdminFrame } from "@/components/preview/admin-frame";

export default function Page() {
  return (
    <AdminFrame>
      <div className="flex h-[calc(100dvh-120px)] min-h-[520px] flex-col">
        <div className="pb-4">
          <h1 className="text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">Messages</h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Conversations with the roster — replies, availability checks and broadcasts in one place.
          </p>
        </div>
        <div className="min-h-0 flex-1">
          <AdminMessenger notifications={preview.notifications} talent={preview.talentList} />
        </div>
      </div>
    </AdminFrame>
  );
}
