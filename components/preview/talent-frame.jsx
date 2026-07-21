"use client";

import { TalentRail } from "@/components/talent/rail";
import { TalentSidebar } from "@/components/talent/sidebar";
import { TalentTopbar } from "@/components/talent/topbar";
import { TalentAiPopup } from "@/components/talent/ai-popup";
import { RailProvider } from "@/components/talent/rail-context";
import { preview } from "@/lib/preview/mock";

const PROFILE = {
  id: "preview-user",
  full_name: "Adaeze Okafor",
  email: "adaeze@candor-management.com",
  role: "talent",
};
const UNREAD = preview.myNotifications.filter((n) => !n.isRead).length;

// Chrome-accurate shell for the talent preview pages: the real rail, sidebar
// and topbar rendered with demo data.
export function TalentFrame({ children }) {
  return (
    <RailProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <TalentRail />
        <TalentSidebar unread={UNREAD} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TalentTopbar profile={PROFILE} talent={preview.me} unread={UNREAD} />
          <main className="flex-1 px-6 pb-16 md:px-10">
            <div className="mx-auto w-full max-w-[1180px]">{children}</div>
          </main>
        </div>
        <TalentAiPopup />
      </div>
    </RailProvider>
  );
}
