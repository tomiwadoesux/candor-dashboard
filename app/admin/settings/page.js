import { teamMembers, systemSettings } from "@/lib/data";

const ROLE_LABELS = {
  ceo: "Chief Executive",
  md: "Managing Director",
  booker: "Booker",
};

const PERMISSIONS = [
  { action: "View roster", booker: true, md: true, ceo: true },
  { action: "Add or edit talent", booker: true, md: true, ceo: true },
  { action: "Create bookings", booker: true, md: true, ceo: true },
  { action: "Post castings", booker: true, md: true, ceo: true },
  { action: "Send communications", booker: true, md: true, ceo: true },
  { action: "Upload documents", booker: true, md: true, ceo: true },
  { action: "Approve milestones", booker: true, md: true, ceo: true },
  { action: "View payments", booker: true, md: true, ceo: true },
  { action: "Process payments", booker: false, md: true, ceo: true },
  { action: "View analytics", booker: false, md: true, ceo: true },
  { action: "Manage team", booker: false, md: true, ceo: true },
  { action: "Edit settings", booker: false, md: true, ceo: true },
  { action: "Delete accounts", booker: false, md: false, ceo: true },
];

function fmtDate(s) {
  const d = new Date(`${s}T00:00:00`);
  return `${d.getDate()} ${d.toLocaleString("en-GB", {
    month: "short",
  })} ${d.getFullYear()}`;
}

export default function SettingsAdminPage() {
  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Operations · Settings
        </div>
        <div className="text-[11px] text-muted-foreground">
          Candor Management · Lagos
        </div>
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        House <span className="editorial-italic">rules</span>
      </h1>
      <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
        Who does what, how the agency defaults fall, and where to reach us.
        Changes here ripple through contracts, invoices and the talent app.
      </p>

      <section className="mt-12">
        <div className="flex items-baseline justify-between pb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            The team
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {teamMembers.length} accounts
          </span>
        </div>
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {teamMembers.map((m, i) => (
            <li key={m.id} className="py-5">
              <div className="grid grid-cols-12 items-start gap-x-4">
                <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                  №{String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-muted/60 font-serif text-[13px] font-light italic text-foreground ring-1 ring-border/60">
                    {m.avatar}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-[18px] font-light text-foreground">
                      {m.name}
                    </h3>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {m.email}
                    </div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Role
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-foreground">
                    {ROLE_LABELS[m.role]}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    Since
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-foreground">
                    {fmtDate(m.joinDate)}
                  </div>
                </div>
                <div className="col-span-1 text-right">
                  <div
                    className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${
                      m.status === "Active"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        m.status === "Active"
                          ? "bg-emerald-500"
                          : "bg-muted-foreground"
                      }`}
                    />
                    {m.status}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

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
            House constants
          </span>
        </div>
        <ul className="divide-y divide-border/60 border-y border-border/60">
          <DefaultRow
            label="Commission"
            value={`${systemSettings.defaultCommissionRate}%`}
            note="Applied to every new contract unless overridden"
          />
          <DefaultRow
            label="Escalation timer"
            value={`${systemSettings.escalationHours} hours`}
            note="A silent message turns red after this window"
          />
          <DefaultRow
            label="Casting window"
            value={`${systemSettings.defaultCastingDeadlineDays} days`}
            note="Default submission window from brief to deadline"
          />
          <DefaultRow
            label="Payment terms · new clients"
            value={systemSettings.defaultPaymentTermsNew}
            note="Upfront, cleared before call time"
          />
          <DefaultRow
            label="Payment terms · established"
            value={systemSettings.defaultPaymentTermsEstablished}
            note="Net 14 from invoice date"
          />
          <DefaultRow
            label="Contact"
            value={systemSettings.contactEmail}
            note="Inbox that routes client enquiries"
          />
          <li className="py-4">
            <div className="grid grid-cols-12 items-center gap-x-4">
              <div className="col-span-4 text-[12.5px] text-muted-foreground">
                Brand colour
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <span
                  className="h-5 w-16 rounded-sm ring-1 ring-border/60"
                  style={{ backgroundColor: systemSettings.brandColour }}
                />
                <span className="font-mono text-[12px] text-foreground">
                  {systemSettings.brandColour}
                </span>
              </div>
              <div className="col-span-3 text-right text-[11px] text-muted-foreground/80">
                House ink · used sparingly
              </div>
            </div>
          </li>
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

function DefaultRow({ label, value, note }) {
  return (
    <li className="py-4">
      <div className="grid grid-cols-12 items-baseline gap-x-4">
        <div className="col-span-4 text-[12.5px] text-muted-foreground">
          {label}
        </div>
        <div className="col-span-5 font-serif text-[20px] font-light text-foreground">
          {value}
        </div>
        <div className="col-span-3 text-right text-[11px] text-muted-foreground/80">
          {note}
        </div>
      </div>
    </li>
  );
}
