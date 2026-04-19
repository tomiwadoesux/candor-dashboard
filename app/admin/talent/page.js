"use client";

import { TalentRoster } from "@/components/admin/roster";
import { onboardingSteps } from "@/lib/data";
import { useTalent } from "@/lib/store";

export default function TalentAdminPage() {
  const talent = useTalent();

  const active = talent.filter((t) => t.status === "Active").length;
  const onboarding = talent.filter((t) => t.status === "Onboarding").length;
  const inactive = talent.filter((t) => t.status === "Inactive").length;
  const boards = new Set(talent.map((t) => t.board)).size;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Operations · Roster
        </div>
        <div className="text-[11px] text-muted-foreground">
          {boards} boards · {talent.length} profiles
        </div>
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Talent</span> roster
      </h1>
      <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-muted-foreground">
        Every contracted face across boards. Tap a name to open the full dossier
        — edits there reflect instantly on the talent&apos;s own dashboard.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat label="On roster" value={talent.length} sub="All statuses" />
        <Stat label="Active" value={active} sub="Currently working" accent="emerald" />
        <Stat label="Onboarding" value={onboarding} sub="In the pipeline" accent="amber" />
        <Stat label="Inactive" value={inactive} sub="Archived / paused" />
      </div>

      <div className="mt-10">
        <TalentRoster talent={talent} onboardingSteps={onboardingSteps} />
      </div>

      {onboarding > 0 && (
        <section className="mt-14">
          <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
            <h2 className="font-serif text-[22px] font-light text-foreground">
              <span className="editorial-italic">Onboarding</span> pipeline
            </h2>
            <span className="font-mono text-[10px] text-muted-foreground/70">
              {onboarding} in flight
            </span>
          </div>
          <ul className="mt-6 space-y-6">
            {talent
              .filter((t) => t.status === "Onboarding")
              .map((t, idx) => (
                <li key={t.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[10px] text-muted-foreground/60">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="font-serif text-[18px] font-light text-foreground">
                        {t.stageName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {t.name} · {t.board}
                      </span>
                    </div>
                    <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                      Step {t.onboardingStep} · {onboardingSteps[t.onboardingStep - 1]}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-0.5">
                    {onboardingSteps.map((s, i) => (
                      <span
                        key={s}
                        className={`h-1 flex-1 rounded-full ${
                          i < t.onboardingStep
                            ? "bg-foreground"
                            : "bg-muted-foreground/15"
                        }`}
                        title={s}
                      />
                    ))}
                  </div>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  const color =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : accent === "amber"
      ? "text-amber-700 dark:text-amber-400"
      : "text-foreground";
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </div>
      <div
        className={`mt-2 font-serif text-[30px] font-light leading-none tracking-[-0.02em] ${color}`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
