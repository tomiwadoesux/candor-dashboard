import { TalentRail } from "@/components/talent/rail";
import { TalentSidebar } from "@/components/talent/sidebar";
import { TalentTopbar } from "@/components/talent/topbar";
import { TalentAiPopup } from "@/components/talent/ai-popup";
import { RailProvider } from "@/components/talent/rail-context";
import { requireRole } from "@/lib/auth";

export const metadata = {
  title: "Candor · Talent",
  description: "The talent portal for Candor Management Agency.",
};

export default async function TalentLayout({ children }) {
  await requireRole("talent");
  return (
    <RailProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <TalentRail />
        <TalentSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TalentTopbar />
          <main className="flex-1 px-10 pb-16">{children}</main>
        </div>
        <TalentAiPopup />
      </div>
    </RailProvider>
  );
}
