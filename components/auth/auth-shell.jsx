export function AuthShell({ title, subtitle, children }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="slide-up-in w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-[18px] font-semibold text-brand-foreground">
            C
          </div>
          <h1 className="mt-3 text-[17px] font-semibold tracking-[-0.01em] text-foreground">
            Candor
          </h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Lagos · London · USA
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="mt-5">{children}</div>
        </div>
        <p className="mt-8 text-center text-[12px] text-muted-foreground">
          contact@candor-management.com
        </p>
      </div>
    </main>
  );
}
