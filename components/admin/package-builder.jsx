"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, Copy, ExternalLink, Trash2, TimerOff } from "lucide-react";
import { createPackage, expirePackage, deletePackage } from "@/lib/actions/packages";
import { relativeTime, dateShort, statusLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function CopyLinkButton({ url }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="pressable inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface-muted"
    >
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

export function PackageCreateForm({ talent, siteUrl }) {
  const [state, action, pending] = useActionState(createPackage, undefined);
  const [selected, setSelected] = useState([]);

  return (
    <form action={action} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="pkg-title" className="text-sm font-medium text-foreground">
            Package title
          </label>
          <Input id="pkg-title" name="title" placeholder="SS26 campaign options" required />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pkg-client" className="text-sm font-medium text-foreground">
            Client (optional)
          </label>
          <Input id="pkg-client" name="clientName" placeholder="Vlisco" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pkg-expiry" className="text-sm font-medium text-foreground">
            Expires after (days)
          </label>
          <Input id="pkg-expiry" name="expiryDays" type="number" min="0" max="365" defaultValue="14" />
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <label htmlFor="pkg-note" className="text-sm font-medium text-foreground">
          Note to the client (optional)
        </label>
        <Input
          id="pkg-note"
          name="note"
          placeholder="Four options for the heritage campaign — all available on your dates."
        />
      </div>

      <div className="mt-5">
        <p className="text-[11.5px] font-medium text-muted-foreground/70">
          Select talent · {selected.length} chosen
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {talent.map((t) => {
            const checked = selected.includes(t.id);
            return (
              <label
                key={t.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors",
                  checked
                    ? "border-border-strong bg-accent"
                    : "border-border bg-background hover:bg-surface-muted"
                )}
              >
                <input
                  type="checkbox"
                  name="talentIds"
                  value={t.id}
                  checked={checked}
                  onChange={(e) =>
                    setSelected((prev) =>
                      e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                    )
                  }
                  className="h-3.5 w-3.5 accent-current"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {t.first_name} {t.last_name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {statusLabel(t.category)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {state?.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-success/10 px-3 py-2.5">
          <p className="text-sm text-success">Package created.</p>
          <CopyLinkButton url={`${siteUrl}/package/${state.token}`} />
          <a
            href={`/package/${state.token}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent-foreground hover:underline"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ) : null}

      <Button type="submit" size="lg" className="pressable mt-5" disabled={pending}>
        {pending ? "Creating…" : "Create package"}
      </Button>
    </form>
  );
}

export function PackageList({ packages, siteUrl, canDelete }) {
  const [isPending, startTransition] = useTransition();

  if (packages.length === 0) {
    return (
      <p className="mt-8 text-sm text-muted-foreground">
        No packages yet — build your first selection above and send the link to a client.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      {packages.map((p) => (
        <div
          key={p.id}
          className={cn(
            "card-hover rounded-2xl border border-border bg-card px-5 py-4",
            p.expired && "opacity-60"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-foreground">{p.title}</h3>
                {p.expired ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground">
                    Expired
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {p.client_name ? `${p.client_name} · ` : ""}
                {p.talent_ids.length} talent · created {relativeTime(p.created_at)}
                {p.expires_at && !p.expired ? ` · expires ${dateShort(p.expires_at)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-foreground"
                data-slot="numeric"
              >
                {p.viewCount} view{p.viewCount === 1 ? "" : "s"}
              </span>
              {!p.expired ? <CopyLinkButton url={`${siteUrl}/package/${p.token}`} /> : null}
              {!p.expired ? (
                <button
                  type="button"
                  title="Expire now"
                  disabled={isPending}
                  onClick={() => startTransition(() => expirePackage(p.id))}
                  className="pressable flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-warning/10 hover:text-warning"
                >
                  <TimerOff className="h-3.5 w-3.5" />
                </button>
              ) : null}
              {canDelete ? (
                <button
                  type="button"
                  title="Delete"
                  disabled={isPending}
                  onClick={() => startTransition(() => deletePackage(p.id))}
                  className="pressable flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
