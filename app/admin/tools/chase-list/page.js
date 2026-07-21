import { requireRole, ADMIN_ROLES } from "@/lib/auth";
import { listOverduePayments } from "@/lib/queries/payments";
import { reminderEmail } from "@/lib/tools/chase";
import { PageIntro, Stat, moneyList } from "@/components/admin/kit";
import { ChaseTable } from "./chase-table";

export default async function ChaseListPage() {
  await requireRole(...ADMIN_ROLES);
  const payments = await listOverduePayments();

  const outstanding = {};
  for (const p of payments) {
    outstanding[p.currency] = (outstanding[p.currency] ?? 0) + Number(p.gross_fee);
  }
  const overdueCount = payments.filter((p) => p.daysOverdue > 0).length;
  // Sorted most-overdue first, so the head of the list is the oldest debt.
  const oldestDays = payments.length > 0 ? payments[0].daysOverdue : 0;

  // Reminder drafts are template-generated server-side for every overdue row.
  const rows = payments.map((p) => ({
    ...p,
    reminder: p.daysOverdue > 0 ? reminderEmail(p) : null,
  }));

  return (
    <div>
      <PageIntro
        eyebrow="Tools · Receivables"
        meta={`${payments.length} invoice${payments.length === 1 ? "" : "s"} awaiting payment`}
        title={
          <>
            The chase list
          </>
        }
        lede="Every invoice still awaiting the client, aged against their payment terms — with a ready-to-send reminder drafted for anything past due."
      />

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-3">
        <Stat
          label="Outstanding"
          value={moneyList(outstanding, "—")}
          sub={`Across ${payments.length} open invoice${payments.length === 1 ? "" : "s"}`}
        />
        <Stat
          label="Overdue"
          value={overdueCount}
          sub="Past their due date"
          accent={overdueCount > 0 ? "destructive" : "success"}
        />
        <Stat
          label="Oldest debt"
          value={oldestDays > 0 ? `${oldestDays}d` : "—"}
          sub={oldestDays > 0 ? "Days past due" : "Nothing overdue yet"}
          accent={oldestDays > 0 ? "warning" : null}
        />
      </div>

      <div className="mt-10">
        <ChaseTable rows={rows} />
      </div>
    </div>
  );
}
