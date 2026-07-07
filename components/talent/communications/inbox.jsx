"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  Camera,
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Megaphone,
  MessagesSquare,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dateLong, relativeTime, statusLabel } from "@/lib/format";
import {
  markNotificationRead,
  respondToNotification,
} from "@/lib/actions/notifications";

const TYPE_META = {
  availability_check: { label: "Availability check", icon: CalendarClock },
  booking_update: { label: "Booking update", icon: CalendarCheck },
  portfolio_request: { label: "Portfolio request", icon: Camera },
  payment_update: { label: "Payment update", icon: Wallet },
  pre_job_brief: { label: "Pre-job brief", icon: FileText },
  general: { label: "General", icon: MessagesSquare },
  announcement: { label: "Announcement", icon: Megaphone },
};

function typeMeta(type) {
  return TYPE_META[type] ?? { label: statusLabel(type), icon: MessagesSquare };
}

// Which buttons an actionable message gets. availability_check → Accept /
// Decline; everything else that requires a response → Confirm / Query.
function actionsFor(type) {
  if (type === "availability_check") {
    return [
      { response: "accepted", label: "Accept", tone: "primary" },
      { response: "declined", label: "Decline", tone: "ghost" },
    ];
  }
  return [
    { response: "confirmed", label: "Confirm", tone: "primary" },
    { response: "queried", label: "Query", tone: "ghost", prompt: true },
  ];
}

const RESPONSE_LABEL = {
  accepted: "Accepted",
  declined: "Declined",
  confirmed: "Confirmed",
  queried: "Query sent",
};

export function NotificationInbox({ notifications }) {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  // Local overlays so the UI answers instantly; the server revalidation
  // catches up in the background.
  const [overrides, setOverrides] = useState({});

  const items = notifications.map((n) => ({
    ...n,
    ...(overrides[n.id] ?? {}),
  }));

  const needsAction = (n) => n.requiresResponse && n.responseStatus === "pending";

  const visible = items.filter((n) => {
    if (filter === "action") return needsAction(n);
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const counts = {
    all: items.length,
    action: items.filter(needsAction).length,
    unread: items.filter((n) => !n.isRead).length,
  };

  const patch = (id, values) =>
    setOverrides((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...values } }));

  const handleOpen = (n) => {
    const opening = openId !== n.id;
    setOpenId(opening ? n.id : null);
    if (opening && !n.isRead && !n.requiresResponse) {
      patch(n.id, { isRead: true });
      // Fire-and-forget; revalidation reconciles the badge counts.
      markNotificationRead(n.id);
    }
  };

  return (
    <div className="max-w-[920px]">
      <div className="flex items-center gap-1 pb-6">
        {[
          { id: "all", label: "All" },
          { id: "action", label: "Action needed" },
          { id: "unread", label: "Unread" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={cn(
              "pressable h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
              filter === t.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            )}
          >
            {t.label}
            {counts[t.id] > 0 && (
              <span
                className={cn(
                  "ml-1.5 text-[10.5px]",
                  filter === t.id ? "text-background/60" : "text-muted-foreground/60"
                )}
              >
                {counts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <ul className="border-t border-border">
        {visible.map((n) => (
          <InboxRow
            key={n.id}
            notification={n}
            open={openId === n.id}
            onToggle={() => handleOpen(n)}
            onResponded={(values) => patch(n.id, values)}
          />
        ))}

        {visible.length === 0 && (
          <li className="py-16 text-center">
            <p className="font-serif text-[18px] italic text-muted-foreground">
              {items.length === 0 ? "No messages yet." : "Nothing here."}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground/70">
              {items.length === 0
                ? "Candor will reach out here about castings, bookings and payments."
                : "Try another filter — or enjoy the quiet."}
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}

function InboxRow({ notification: n, open, onToggle, onResponded }) {
  const meta = typeMeta(n.type);
  const Icon = meta.icon;
  const actionNeeded = n.requiresResponse && n.responseStatus === "pending";
  const responded = n.requiresResponse && n.responseStatus !== "pending";

  return (
    <li className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="relative flex w-full items-start gap-4 px-1 py-5 text-left outline-hidden hover:bg-surface-muted/40"
      >
        <span
          aria-hidden
          className={cn(
            "absolute left-[-10px] top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full",
            actionNeeded ? "bg-warning opacity-100" : "bg-transparent"
          )}
        />

        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {!n.isRead && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-bronze"
              />
            )}
            <span
              className={cn(
                "truncate text-[14px] tracking-[-0.005em]",
                n.isRead
                  ? "font-medium text-foreground/80"
                  : "font-semibold text-foreground"
              )}
            >
              {n.title}
            </span>
            {actionNeeded && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-warning">
                <Clock className="h-2.5 w-2.5" />
                Awaiting you
              </span>
            )}
            {responded && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-success">
                <Check className="h-2.5 w-2.5" />
                {RESPONSE_LABEL[n.responseStatus] ?? statusLabel(n.responseStatus)}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">
            {meta.label}
            {n.isBroadcast ? " · To the roster" : ""}
          </div>
          <p
            className={cn(
              "mt-1 line-clamp-1 text-[12.5px]",
              open ? "text-muted-foreground/60" : "text-muted-foreground"
            )}
          >
            {n.body}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {relativeTime(n.createdAt)}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="slide-up-in overflow-hidden pb-6 pl-[52px] pr-2">
          <div className="rounded-xl border border-border bg-surface-muted/40 p-5">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">From Candor</span>
              <span className="text-muted-foreground/40">·</span>
              <span>{dateLong(n.createdAt)}</span>
            </div>

            <p className="mt-3 whitespace-pre-line font-serif text-[16px] leading-[1.55] text-foreground">
              {n.body}
            </p>

            <div className="mt-5">
              {!n.requiresResponse ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-[11.5px] text-muted-foreground ring-1 ring-border">
                  <Check className="h-3 w-3" />
                  No action required
                </div>
              ) : responded ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11.5px] font-medium text-background">
                    <Check className="h-3 w-3" />
                    You responded — {RESPONSE_LABEL[n.responseStatus] ?? statusLabel(n.responseStatus)}
                  </span>
                  {n.responseText && (
                    <span className="text-[11.5px] italic text-muted-foreground">
                      &ldquo;{n.responseText}&rdquo;
                    </span>
                  )}
                  {n.respondedAt && (
                    <span className="text-[10.5px] text-muted-foreground/60">
                      {relativeTime(n.respondedAt)}
                    </span>
                  )}
                </div>
              ) : (
                <ResponseActions notification={n} onResponded={onResponded} />
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function ResponseActions({ notification: n, onResponded }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [showQuery, setShowQuery] = useState(false);
  const [queryText, setQueryText] = useState("");

  const submit = (response, text) => {
    setError(null);
    startTransition(async () => {
      const result = await respondToNotification(n.id, response, text);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onResponded({
        isRead: true,
        responseStatus: response,
        responseText: text ?? null,
        respondedAt: new Date().toISOString(),
      });
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {actionsFor(n.type).map((a) => (
          <button
            key={a.response}
            type="button"
            disabled={pending}
            onClick={() => {
              if (a.prompt) {
                setShowQuery((v) => !v);
              } else {
                submit(a.response);
              }
            }}
            className={cn(
              "pressable inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-medium transition-colors disabled:opacity-50",
              a.tone === "primary"
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "border border-border bg-background text-foreground hover:border-border-strong"
            )}
          >
            {pending ? "Saving…" : a.label}
          </button>
        ))}
      </div>

      {showQuery && (
        <div className="slide-up-in space-y-2 rounded-lg border border-border bg-background p-3">
          <label
            htmlFor={`query-${n.id}`}
            className="block text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70"
          >
            Your query
          </label>
          <textarea
            id={`query-${n.id}`}
            autoFocus
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            rows={2}
            placeholder="What's unclear? Your booker will reply."
            className="w-full resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowQuery(false);
                setQueryText("");
              }}
              className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
            <button
              type="button"
              disabled={pending || !queryText.trim()}
              onClick={() => submit("queried", queryText.trim())}
              className="pressable inline-flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-[12px] font-medium text-background transition-opacity disabled:opacity-30"
            >
              {pending ? "Sending…" : "Send query"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="inline-flex items-center gap-1.5 text-[12px] text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
