// Server-rendered roster grid — photo cards from the public_roster view.
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
      <div className="rounded-2xl border border-dashed border-border bg-surface-muted/40 py-14 text-center">
        <p className="text-[14px] font-medium text-foreground">
          {q ? "No one matches that" : "The roster is being curated"}
        </p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          {q ? "Try a different name or category." : "Check back soon."}
        </p>
      </div>
    );
  }

  return (
    <ul className="stagger-in grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {roster.map((t) => {
        const name = `${t.first_name} ${t.last_name}`;
        const handle = t.instagram_handle?.replace(/^@/, "");
        return (
          <li key={t.id} className="group">
            <div className="card-hover overflow-hidden rounded-2xl border border-border bg-card">
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
                    className="h-full w-full object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.02]"
                  />
                ) : (
                  <span className="text-[56px] font-light tracking-[-0.04em] text-foreground/25">
                    {t.first_name?.[0]}
                  </span>
                )}
              </div>
              <div className="px-3.5 py-3">
                <h3 className="truncate text-[13.5px] font-semibold text-foreground">
                  {name}
                </h3>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <span>{statusLabel(t.category)}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5" />
                    {statusLabel(t.primary_location)}
                  </span>
                </div>
                {handle && (
                  <a
                    href={`https://instagram.com/${handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand transition-colors hover:text-brand-hover"
                  >
                    <IgIcon className="h-3 w-3" />@{handle}
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
