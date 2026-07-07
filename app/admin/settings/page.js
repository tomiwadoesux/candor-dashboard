import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageIntro } from "@/components/admin/kit";
import { TeamManagement } from "@/components/admin/team-management";

const PERMISSIONS = [
  { action: "View roster & bookings", booker: true, md: true, ceo: true },
  { action: "Add or edit talent", booker: true, md: true, ceo: true },
  { action: "Create bookings & castings", booker: true, md: true, ceo: true },
  { action: "Send communications", booker: true, md: true, ceo: true },
  { action: "Approve milestones", booker: true, md: true, ceo: true },
  { action: "View payments", booker: true, md: true, ceo: true },
  { action: "Process payments", booker: false, md: true, ceo: true },
  { action: "View analytics", booker: false, md: true, ceo: true },
  { action: "Create team accounts", booker: false, md: true, ceo: true },
  { action: "Deactivate accounts", booker: false, md: false, ceo: true },
];

const DEFAULTS = [
  {
    label: "Commission",
    value: "20%",
    note: "Applied to every new contract unless overridden per talent",
  },
  {
    label: "Currencies",
    value: "NGN · GBP · USD",
    note: "Fees and payouts are tracked per currency",
  },
  {
    label: "Escalation timer",
    value: "10 hours",
    note: "A silent response-required message escalates after this window",
  },
  {
    label: "Payment terms · new clients",
    value: "100% upfront",
    note: "Cleared before call time",
  },
  {
    label: "Payment terms · established",
    value: "Net 14",
    note: "From invoice date",
  },
];

export default async function SettingsAdminPage() {
  const profile = await requireRole("md", "ceo");

  // The data layer has no team query — a deliberate one-off, per the contract.
  const supabase = await createClient();
  const { data: team, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at, last_login")
    .neq("role", "talent")
    .order("created_at", { ascending: true });
  if (error) throw new Error("Could not load the team. Please try again.");

  return (
    <div>
      <PageIntro
        eyebrow="Business · Settings"
        meta="Candor Management · Lagos"
        title={
          <>
            House <span className="editorial-italic">rules</span>
          </>
        }
        lede="Who does what, and how the agency defaults fall. Team changes here ripple through every login."
      />

      <div className="mt-12">
        <TeamManagement
          team={(team || []).map((m) => ({
            id: m.id,
            full_name: m.full_name,
            email: m.email,
            role: m.role,
            is_active: m.is_active,
            created_at: m.created_at,
            last_login: m.last_login,
          }))}
          viewer={{ id: profile.id, role: profile.role }}
        />
      </div>

      <section className="mt-14">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Who can do what
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            Role · permission matrix
          </span>
        </div>
        <div className="border-y border-border/60">
          <div className="grid grid-cols-12 items-baseline py-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
            <div className="col-span-6">Action</div>
            <div className="col-span-2 text-center">Booker</div>
            <div className="col-span-2 text-center">MD</div>
            <div className="col-span-2 text-center">CEO</div>
          </div>
          <ul className="divide-y divide-border/60 border-t border-border/60">
            {PERMISSIONS.map((p) => (
              <li key={p.action}>
                <div className="grid grid-cols-12 items-baseline py-2.5 text-[12.5px]">
                  <div className="col-span-6 text-foreground">{p.action}</div>
                  <Perm col={p.booker} />
                  <Perm col={p.md} />
                  <Perm col={p.ceo} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Defaults
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            House constants · read-only
          </span>
        </div>
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {DEFAULTS.map((d) => (
            <li key={d.label} className="py-4">
              <div className="grid grid-cols-12 items-baseline gap-x-4">
                <div className="col-span-4 text-[12.5px] text-muted-foreground">
                  {d.label}
                </div>
                <div className="col-span-5 font-serif text-[20px] font-light text-foreground">
                  {d.value}
                </div>
                <div className="col-span-3 text-right text-[11px] text-muted-foreground/80">
                  {d.note}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Perm({ col }) {
  return (
    <div className="col-span-2 text-center">
      {col ? (
        <span className="font-serif text-[15px] text-foreground">●</span>
      ) : (
        <span className="font-mono text-[12px] text-muted-foreground/40">—</span>
      )}
    </div>
  );
}
