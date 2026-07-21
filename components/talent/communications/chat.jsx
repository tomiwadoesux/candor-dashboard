"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowUp,
  Camera,
  CalendarCheck,
  CalendarClock,
  Check,
  FileText,
  Megaphone,
  MessagesSquare,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { statusLabel, timeShort } from "@/lib/format";
import { dayKey, dayLabel } from "@/lib/chat-format";
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
      { response: "accepted", label: "Accept" },
      { response: "declined", label: "Decline" },
    ];
  }
  return [{ response: "confirmed", label: "Confirm" }];
}

const RESPONSE_LABEL = {
  accepted: "Accepted",
  declined: "Declined",
  confirmed: "Confirmed",
  queried: "Query sent",
};

function CandorAvatar({ className }) {
  return (
    <span
      className={cn(
        "grid h-6 w-6 shrink-0 select-none place-items-center rounded-full bg-brand text-[11px] font-semibold text-brand-foreground",
        className
      )}
    >
      C
    </span>
  );
}

export function ChatThread({ notifications }) {
  const [filter, setFilter] = useState("all");
  // Local overlays so the UI answers instantly; the server revalidation
  // catches up in the background.
  const [overrides, setOverrides] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef(null);
  const markedRef = useRef(false);

  const items = useMemo(
    () => notifications.map((n) => ({ ...n, ...(overrides[n.id] ?? {}) })),
    [notifications, overrides]
  );

  // Opening the thread reads it, like any messenger — pure external sync,
  // no local state needed (the thread never styles by read state).
  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;
    const unread = notifications.filter((n) => !n.isRead && !n.requiresResponse);
    if (unread.length === 0) return;
    Promise.allSettled(unread.map((n) => markNotificationRead(n.id)));
  }, [notifications]);

  const needsReply = (n) => n.requiresResponse && n.responseStatus === "pending";
  const openRequests = items.filter(needsReply);

  // Build the timeline: incoming messages plus the talent's own responses,
  // each at its real timestamp.
  const timeline = useMemo(() => {
    const rows = [];
    for (const n of items) {
      if (filter === "action" && !needsReply(n)) continue;
      rows.push({ kind: "in", at: n.createdAt, n, key: `in-${n.id}` });
      if (filter !== "action" && n.requiresResponse && n.responseStatus !== "pending") {
        rows.push({
          kind: "out",
          at: n.respondedAt ?? n.createdAt,
          n,
          key: `out-${n.id}`,
        });
      }
    }
    rows.sort((a, b) => new Date(a.at) - new Date(b.at));

    const grouped = [];
    let lastDay = null;
    for (const row of rows) {
      const k = dayKey(row.at);
      if (k !== lastDay) {
        grouped.push({ kind: "day", at: row.at, key: `day-${k}` });
        lastDay = k;
      }
      grouped.push(row);
    }
    return grouped;
  }, [items, filter]);

  // Keep the newest message in view, the way a conversation should open.
  const count = timeline.length;
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count, filter]);

  const patch = (id, values) =>
    setOverrides((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...values } }));

  const respond = (n, response, text) => {
    setError(null);
    startTransition(async () => {
      const result = await respondToNotification(n.id, response, text);
      if (result?.error) {
        setError(result.error);
        return;
      }
      patch(n.id, {
        isRead: true,
        responseStatus: response,
        responseText: text ?? null,
        respondedAt: new Date().toISOString(),
      });
      if (replyTo?.id === n.id) {
        setReplyTo(null);
        setDraft("");
      }
    });
  };

  const sendDraft = () => {
    const text = draft.trim();
    const target = replyTo ?? (openRequests.length === 1 ? openRequests[0] : null);
    if (!text || !target) return;
    respond(target, "queried", text);
  };

  const composerTarget = replyTo ?? (openRequests.length === 1 ? openRequests[0] : null);
  const composerDisabled = openRequests.length === 0;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[760px] flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-3.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-[14px] font-semibold text-brand-foreground">
          C
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-[15px] font-semibold leading-tight text-foreground">
            Candor Team
          </h1>
          <p className="text-[12px] text-muted-foreground">
            {openRequests.length > 0
              ? `${openRequests.length} ${openRequests.length === 1 ? "request" : "requests"} waiting on you`
              : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {[
            { id: "all", label: "All" },
            { id: "action", label: "Needs reply" },
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
              {t.id === "action" && openRequests.length > 0 && (
                <span
                  className={cn(
                    "ml-1.5 tabular-nums",
                    filter === t.id ? "text-background/70" : "text-brand"
                  )}
                >
                  {openRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto py-5 [scrollbar-gutter:stable]"
      >
        {timeline.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <CandorAvatar className="h-10 w-10 text-[16px]" />
            <p className="mt-3 text-[14px] font-medium text-foreground">
              {filter === "action" ? "Nothing needs a reply" : "No messages yet"}
            </p>
            <p className="mt-1 max-w-[36ch] text-[12.5px] text-muted-foreground">
              {filter === "action"
                ? "You're all caught up."
                : "Castings, bookings and payment updates from your team land here."}
            </p>
          </div>
        )}

        <ul className="space-y-1.5">
          {timeline.map((row, i) => {
            if (row.kind === "day") {
              return (
                <li key={row.key} className="flex justify-center py-3">
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {dayLabel(row.at)}
                  </span>
                </li>
              );
            }

            const prev = timeline[i - 1];
            const clusterStart = !prev || prev.kind !== row.kind;

            if (row.kind === "out") {
              return (
                <OutgoingBubble key={row.key} row={row} />
              );
            }

            return (
              <IncomingItem
                key={row.key}
                row={row}
                showAvatar={clusterStart}
                pending={pending}
                onRespond={respond}
                onReply={(n) => {
                  setReplyTo(n);
                  setError(null);
                }}
              />
            );
          })}
        </ul>
      </div>

      {/* Composer */}
      <div className="border-t border-border pt-3">
        {error && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-[12px] text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}

        {composerTarget && (
          <div className="slide-up-in mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className="h-3 w-[2px] rounded-full bg-brand" />
            <span className="min-w-0 truncate">
              Replying to <span className="font-medium text-foreground">{composerTarget.title}</span>
            </span>
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                aria-label="Cancel reply"
                className="text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendDraft();
          }}
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-input bg-surface px-3 py-2 transition-[border-color,box-shadow] duration-140 ease-[var(--ease-out)]",
            !composerDisabled && "focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-ring",
            composerDisabled && "opacity-70"
          )}
        >
          <textarea
            rows={1}
            value={draft}
            disabled={composerDisabled || pending}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendDraft();
              }
            }}
            placeholder={
              composerDisabled
                ? "Replies attach to requests from your team — none open right now"
                : composerTarget
                  ? "Ask a question about this request…"
                  : "Tap Reply on a request above to answer it"
            }
            className="max-h-32 min-h-[28px] flex-1 resize-none bg-transparent py-0.5 text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={composerDisabled || pending || !draft.trim() || !composerTarget}
            aria-label="Send"
            className="pressable flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground transition-[opacity,background-color] duration-150 hover:bg-brand-hover disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-1.5 px-1 text-[11px] text-muted-foreground/60">
          For anything else, email bookings@candormanagement.com
        </p>
      </div>
    </div>
  );
}

function IncomingItem({ row, showAvatar, pending, onRespond, onReply }) {
  const n = row.n;
  const meta = typeMeta(n.type);
  const Icon = meta.icon;
  const actionable = n.requiresResponse;
  const open = actionable && n.responseStatus === "pending";

  return (
    <li className="bubble-enter flex items-end gap-2">
      {showAvatar ? <CandorAvatar /> : <span className="w-6 shrink-0" />}

      {actionable ? (
        <div
          className={cn(
            "w-full max-w-[min(88%,30rem)] overflow-hidden rounded-2xl rounded-bl-md border bg-card",
            open ? "border-brand/30" : "border-border"
          )}
        >
          <div className="flex items-center gap-2 border-b border-border/60 px-3.5 py-2">
            <Icon className="h-3.5 w-3.5 text-brand" />
            <span className="text-[11.5px] font-medium text-muted-foreground">
              {meta.label}
              {n.isBroadcast ? " · to the roster" : ""}
            </span>
            <span className="ml-auto font-mono text-[10.5px] text-muted-foreground/60">
              {timeShort(n.createdAt)}
            </span>
          </div>
          <div className="px-3.5 py-3">
            <div className="text-[13.5px] font-semibold text-foreground">{n.title}</div>
            <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-foreground/90">
              {n.body}
            </p>

            {open ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {actionsFor(n.type).map((a) => (
                  <button
                    key={a.response}
                    type="button"
                    disabled={pending}
                    onClick={() => onRespond(n, a.response)}
                    className={cn(
                      "pressable inline-flex h-8 items-center rounded-full px-3.5 text-[12.5px] font-medium transition-colors disabled:opacity-50",
                      a.response === "declined"
                        ? "border border-border bg-surface text-foreground hover:border-border-strong"
                        : "bg-brand text-brand-foreground hover:bg-brand-hover"
                    )}
                  >
                    {a.label}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onReply(n)}
                  className="pressable inline-flex h-8 items-center rounded-full border border-border bg-surface px-3.5 text-[12.5px] font-medium text-foreground transition-colors hover:border-border-strong disabled:opacity-50"
                >
                  Ask a question
                </button>
              </div>
            ) : (
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-success">
                <Check className="h-3.5 w-3.5" />
                {RESPONSE_LABEL[n.responseStatus] ?? statusLabel(n.responseStatus)}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex max-w-[min(88%,30rem)] flex-col gap-1">
          <div className="bubble bubble-in">
            {n.title && n.title !== n.body && (
              <div className="mb-0.5 font-semibold">{n.title}</div>
            )}
            <span className="whitespace-pre-line">{n.body}</span>
          </div>
          <span className="px-1 font-mono text-[10.5px] text-muted-foreground/60">
            {n.isBroadcast ? "To the roster · " : ""}
            {timeShort(n.createdAt)}
          </span>
        </div>
      )}
    </li>
  );
}

function OutgoingBubble({ row }) {
  const n = row.n;
  const isQuery = n.responseStatus === "queried" && n.responseText;
  return (
    <li className="bubble-enter flex justify-end">
      <div className="flex max-w-[min(88%,30rem)] flex-col items-end gap-1">
        <div className="bubble bubble-out">
          {isQuery ? (
            <span className="whitespace-pre-line">{n.responseText}</span>
          ) : (
            <>
              <span className="whitespace-nowrap font-medium">
                <Check className="mr-1 inline-block h-3.5 w-3.5 align-[-2px]" />
                {RESPONSE_LABEL[n.responseStatus] ?? statusLabel(n.responseStatus)}
              </span>
              <span className="opacity-75"> — {n.title}</span>
            </>
          )}
        </div>
        <span className="px-1 font-mono text-[10.5px] text-muted-foreground/60">
          {timeShort(row.at)}
        </span>
      </div>
    </li>
  );
}
