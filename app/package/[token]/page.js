import { notFound } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { statusLabel, dateShort } from "@/lib/format";

export const metadata = { title: "Talent selection — Candor" };

// Public, token-gated client lookbook. Data comes exclusively through the
// SECURITY DEFINER get_package_by_token() function — anon has no table access.
export default async function PackagePage({ params }) {
  const { token } = await params;

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: pkg } = await supabase.rpc("get_package_by_token", {
    p_token: token,
  });
  if (!pkg) notFound();

  // Fire-and-forget view log; a failed log must never break the page.
  supabase.rpc("log_package_view", { p_token: token }).then(
    () => {},
    () => {}
  );

  const talent = pkg.talent ?? [];

  return (
    <main className="min-h-dvh bg-background px-6 pb-24 text-foreground">
      <header className="mx-auto max-w-5xl pt-14 text-center">
        <div className="inline-flex flex-col items-center">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-[16px] font-semibold text-brand-foreground">
            C
          </span>
          <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Candor · Lagos · London · USA
          </p>
        </div>
        <h1 className="mt-10 font-serif text-4xl font-light leading-tight tracking-[-0.01em] sm:text-5xl">
          {pkg.title}
        </h1>
        {pkg.client_name ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Prepared for <span className="editorial-italic text-foreground">{pkg.client_name}</span>
          </p>
        ) : null}
        {pkg.note ? (
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {pkg.note}
          </p>
        ) : null}
        {pkg.expires_at ? (
          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
            Selection available until {dateShort(pkg.expires_at)}
          </p>
        ) : null}
      </header>

      <section className="mx-auto mt-14 grid max-w-5xl gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {talent.map((t, i) => (
          <article key={t.id} className="stagger-in">
            <div className="polaroid rounded-sm">
              <div className="aspect-[3/4] w-full overflow-hidden bg-surface-muted">
                {t.polaroid_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.polaroid_url}
                    alt={`${t.first_name} ${t.last_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-5xl italic text-muted-foreground/40">
                    {t.first_name?.[0]}
                    {t.last_name?.[0]}
                  </div>
                )}
              </div>
              <p className="pt-2 text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </p>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-lg font-semibold">
                {t.first_name} {t.last_name}
              </h2>
              <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {statusLabel(t.category)} · {statusLabel(t.primary_location)}
              </p>
              {t.measurements?.height_display ? (
                <p className="mt-2 text-xs text-muted-foreground" data-slot="numeric">
                  {[
                    t.measurements.height_display,
                    t.measurements.bust && `B ${t.measurements.bust}`,
                    t.measurements.waist && `W ${t.measurements.waist}`,
                    t.measurements.hips && `H ${t.measurements.hips}`,
                    t.measurements.shoe_uk && `Shoe ${t.measurements.shoe_uk}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              {t.bio ? (
                <p className="mx-auto mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                  {t.bio}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <footer className="mx-auto mt-20 max-w-5xl border-t border-border pt-8 text-center">
        <p className="text-sm text-muted-foreground">
          To book any of this talent, reply to your Candor contact or write to{" "}
          <a
            href="mailto:contact@candor-management.com"
            className="font-medium text-brand transition-colors hover:text-brand-hover"
          >
            contact@candor-management.com
          </a>
        </p>
      </footer>
    </main>
  );
}
