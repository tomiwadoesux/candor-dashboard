import { ArrowUpRight, ListChecks, Package, Radar, Receipt, Sparkles } from "lucide-react";
import { PageIntro } from "@/components/admin/kit";
import { AdminFrame } from "@/components/preview/admin-frame";

const TOOLS = [
  { icon: Sparkles, name: "Brief parser", description: "Paste a messy client email or WhatsApp brief — AI extracts the casting or booking fields." },
  { icon: Radar, name: "Availability radar", description: "Who is free, pencilled or booked across any date window." },
  { icon: ListChecks, name: "Chase list", description: "Everything that needs a nudge today, in one queue." },
  { icon: Receipt, name: "Invoice studio", description: "Branded invoices — open any payment → Invoice." },
  { icon: Package, name: "Package builder", description: "Curate a talent package to send to a client." },
];

export default function Page() {
  return (
    <AdminFrame>
      <PageIntro
        eyebrow="Operations · Tools"
        meta={`${TOOLS.length} tools`}
        title={<>Internal tools</>}
        lede="Speed-tools for the booking desk — parse briefs, scan availability, chase what's overdue and package talent."
      />
      <div className="stagger-in mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <div key={tool.name} className="card-hover group flex flex-col rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <tool.icon className="h-4 w-4 text-brand" />
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <div className="mt-5 text-[13.5px] font-medium tracking-[-0.01em] text-foreground">{tool.name}</div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{tool.description}</p>
          </div>
        ))}
      </div>
    </AdminFrame>
  );
}
