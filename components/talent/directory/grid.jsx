// Server-rendered roster grid — polaroid cards from the public_roster view.
import { MapPin } from "lucide-react";
import { gradientFor } from "@/lib/gradients";
import { statusLabel } from "@/lib/format";

function IgIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function DirectoryGrid({ roster, q }) {
  if (roster.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 py-16 text-center">
        <p className="font-serif text-[18px] italic text-muted-foreground">
          {q ? "No one matches that." : "The roster is being curated."}
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground/70">
          {q ? "Try a different name or category." : "Check back soon."}
        </p>
      </div>
    );
  }

  return (
    <ul className="stagger-in grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {roster.map((t) => {
        const name = `${t.first_name} ${t.last_name}`;
        const handle = t.instagram_handle?.replace(/^@/, "");
        return (
          <li key={t.id} className="group flex flex-col items-center">
            <div className="flex w-full max-w-[220px] flex-col overflow-hidden rounded-sm border border-border/60 bg-card transition-[transform,box-shadow] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-lg">
              <div
                className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden"
                style={
                  t.polaroid_url ? undefined : { background: gradientFor(t.id) }
                }
              >
                {t.polaroid_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.polaroid_url}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <span className="font-serif text-[72px] font-light italic tracking-[-0.04em] text-foreground/30 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04] dark:mix-blend-screen">
                    {t.first_name?.[0]}
                  </span>
                )}
              </div>
              <div className="flex w-full items-center justify-between border-t border-border/40 px-3 py-2.5">
                <span className="truncate font-serif text-[13px] italic text-foreground/90">
                  {t.first_name}
                </span>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/60">
                  {statusLabel(t.category)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex w-full flex-col items-center text-center">
              <h3 className="font-serif text-[19px] font-light tracking-[-0.015em] text-foreground">
                {name}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{statusLabel(t.category)}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" />
                  {statusLabel(t.primary_location)}
                </span>
              </div>

              {handle && (
                <div className="mt-3">
                  <a
                    href={`https://instagram.com/${handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                  >
                    <IgIcon className="h-3 w-3" />@{handle}
                  </a>
                </div>
              )}

              {t.bio && (
                <p className="mt-3 line-clamp-2 max-w-[28ch] text-[11.5px] leading-relaxed text-muted-foreground">
                  {t.bio}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
