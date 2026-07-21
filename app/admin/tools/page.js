import Link from "next/link";
import {
  ArrowUpRight,
  ListChecks,
  Package,
  Radar,
  Receipt,
  Sparkles,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { PageIntro } from "@/components/admin/kit";

const TOOLS = [
  {
    href: "/admin/tools/brief-parser",
    icon: Sparkles,
    name: "Brief parser",
    description:
      "Paste a messy client email or WhatsApp brief — AI extracts the casting or booking fields.",
  },
  {
    href: "/admin/tools/availability",
    icon: Radar,
    name: "Availability radar",
    description: "Who is free, pencilled or booked across any date window.",
  },
  {
    href: "/admin/tools/chase-list",
    icon: ListChecks,
    name: "Chase list",
    description: "Everything that needs a nudge today, in one queue.",
  },
  {
    href: "/admin/invoicing",
    icon: Receipt,
    name: "Invoice studio",
    description: "Branded invoices — open any payment → Invoice.",
  },
  {
    href: "/admin/tools/packages",
    icon: Package,
    name: "Package builder",
    description: "Curate a talent package to send to a client.",
  },
];

export default async function ToolsPage() {
  await requireRole("booker", "md", "ceo");

  return (
    <div>
      <PageIntro
        eyebrow="Operations · Tools"
        meta={`${TOOLS.length} tools`}
        title={
          <>
            Internal tools
          </>
        }
        lede="Speed-tools for the booking desk — parse briefs, scan availability, chase what's overdue and package talent."
      />

      <div className="stagger-in mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="card-hover pressable group flex flex-col rounded-sm border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <tool.icon className="h-4 w-4 text-brand" />
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
            <div className="mt-5 text-[13.5px] font-medium tracking-[-0.01em] text-foreground">
              {tool.name}
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
