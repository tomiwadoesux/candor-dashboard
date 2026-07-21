import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = { title: "Candor — Preview gallery" };

const TALENT = [
  ["Overview", "/preview/talent/overview"],
  ["Bookings", "/preview/talent/bookings"],
  ["Payments", "/preview/talent/payments"],
  ["Messages", "/preview/talent/communications"],
  ["Documents", "/preview/talent/documents"],
  ["Calendar", "/preview/talent/calendar"],
  ["Casting board", "/preview/talent/castings"],
  ["Milestones", "/preview/talent/milestones"],
  ["Portfolio", "/preview/talent/portfolio"],
  ["Directory", "/preview/talent/directory"],
];

const ADMIN = [
  ["Overview", "/preview/admin/overview"],
  ["Talent roster", "/preview/admin/talent"],
  ["Clients", "/preview/admin/clients"],
  ["Bookings", "/preview/admin/bookings"],
  ["Casting board", "/preview/admin/casting"],
  ["Messages", "/preview/admin/communications"],
  ["Community feed", "/preview/admin/community"],
  ["Milestones", "/preview/admin/milestones"],
  ["Documents", "/preview/admin/documents"],
  ["AI activity", "/preview/admin/ai-activity"],
  ["Invoicing", "/preview/admin/invoicing"],
  ["Analytics", "/preview/admin/analytics"],
  ["Tools", "/preview/admin/tools"],
  ["Settings", "/preview/admin/settings"],
];

function Group({ label, items }) {
  return (
    <section>
      <h2 className="text-[13px] font-medium text-muted-foreground">{label}</h2>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([title, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="card-hover group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-[13.5px] font-medium text-foreground"
            >
              {title}
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-[transform,color] duration-200 ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function PreviewIndex() {
  return (
    <main className="min-h-dvh bg-background px-6 py-16 text-foreground">
      <div className="mx-auto w-full max-w-[960px]">
        <div className="flex items-center gap-3 pb-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-[16px] font-semibold text-brand-foreground">
            C
          </span>
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Candor — Preview gallery</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Every dashboard tab with demo data. No login — the live app is untouched.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-10">
          <Group label="Talent" items={TALENT} />
          <Group label="Admin" items={ADMIN} />
        </div>
      </div>
    </main>
  );
}
