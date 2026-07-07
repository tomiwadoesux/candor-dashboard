export function AuthShell({ title, subtitle, children }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm slide-up-in">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-muted-foreground">
            Lagos · London · USA
          </p>
          <h1 className="font-serif mt-3 text-5xl tracking-[0.08em] text-foreground">
            CANDOR
          </h1>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="mt-5">{children}</div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          contact@candor-management.com
        </p>
      </div>
    </main>
  );
}
