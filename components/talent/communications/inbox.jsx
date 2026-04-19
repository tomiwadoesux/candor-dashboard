"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ME_ID = "1";
const NOW = new Date("2026-04-18T20:00:00");

const ACTIONS = {
  availability_check: [
    { id: "Available", label: "Available", tone: "primary" },
    { id: "Not available", label: "Not available", tone: "ghost" },
  ],
  booking_update: [
    { id: "Accepted", label: "Accepted", tone: "primary" },
    { id: "Query", label: "Query", tone: "ghost", prompt: true },
  ],
  portfolio_request: [{ id: "Confirmed", label: "Confirmed", tone: "primary" }],
  pre_job_brief: [{ id: "Acknowledged", label: "Acknowledged", tone: "primary" }],
  payment_update: [],
  general: [],
  announcement: [],
};

const TYPE_LABEL = {
  availability_check: "Availability check",
  booking_update: "Booking update",
  portfolio_request: "Portfolio request",
  pre_job_brief: "Pre-job brief",
  payment_update: "Payment update",
  general: "General",
  announcement: "Announcement",
};

function relativeTime(iso) {
  const then = new Date(iso);
  const diff = NOW - then;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function statusFor(msg, myResponse) {
  const hasActions = (ACTIONS[msg.type] || []).length > 0;
  if (!hasActions) return { kind: "info", label: "Read" };
  if (myResponse?.response === "Query") {
    return { kind: "awaiting", label: "Awaiting reply" };
  }
  if (myResponse) return { kind: "read", label: "Responded" };
  return { kind: "action", label: "Action needed" };
}

export function TalentInbox({ messages, myId = ME_ID }) {
  const enriched = useMemo(
    () =>
      messages
        .map((m) => ({
          ...m,
          myResponse: m.responses?.find((r) => r.talentId === myId) || null,
        }))
        .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)),
    [messages, myId]
  );

  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(() =>
    enriched.find((m) => statusFor(m, m.myResponse).kind === "action")?.id || null
  );
  const [localResponses, setLocalResponses] = useState({});
  const [queryDraft, setQueryDraft] = useState({});

  const visible = enriched.filter((m) => {
    if (filter === "all") return true;
    const status = localResponses[m.id]
      ? { kind: localResponses[m.id].response === "Query" ? "awaiting" : "read" }
      : statusFor(m, m.myResponse);
    if (filter === "action") return status.kind === "action";
    if (filter === "awaiting") return status.kind === "awaiting";
    if (filter === "read") return status.kind === "read" || status.kind === "info";
    return true;
  });

  const countsFor = (kind) =>
    enriched.filter((m) => {
      const local = localResponses[m.id];
      const s = local
        ? { kind: local.response === "Query" ? "awaiting" : "read" }
        : statusFor(m, m.myResponse);
      if (kind === "read") return s.kind === "read" || s.kind === "info";
      return s.kind === kind;
    }).length;

  const respond = (id, response, note) => {
    setLocalResponses((prev) => ({
      ...prev,
      [id]: { response, note: note || null, at: new Date().toISOString() },
    }));
    setQueryDraft((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="max-w-[920px]">
      <div className="flex items-center gap-1 pb-6">
        {[
          { id: "all", label: "All", count: enriched.length },
          { id: "action", label: "Action needed", count: countsFor("action") },
          { id: "awaiting", label: "Awaiting reply", count: countsFor("awaiting") },
          { id: "read", label: "Read", count: countsFor("read") },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={cn(
              "h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
              filter === t.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            )}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={cn(
                  "ml-1.5 text-[10.5px]",
                  filter === t.id ? "text-background/60" : "text-muted-foreground/60"
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <ul className="border-t border-border">
        {visible.map((m) => {
          const local = localResponses[m.id];
          const effectiveResponse = local || m.myResponse;
          const status = local
            ? local.response === "Query"
              ? { kind: "awaiting", label: "Awaiting reply" }
              : { kind: "read", label: "Responded" }
            : statusFor(m, m.myResponse);
          const actions = ACTIONS[m.type] || [];
          const isOpen = openId === m.id;
          const isUnread = status.kind === "action" || (status.kind === "info" && !m.myResponse);

          return (
            <li
              key={m.id}
              className="group border-b border-border"
              data-unread={isUnread}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : m.id)}
                className={cn(
                  "relative flex w-full items-start gap-4 px-1 py-5 text-left outline-hidden",
                  "hover:bg-surface-muted/40"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[-10px] top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full transition-[opacity,transform] duration-200",
                    status.kind === "action"
                      ? "bg-destructive opacity-100"
                      : status.kind === "awaiting"
                        ? "bg-warning opacity-100"
                        : "bg-transparent"
                  )}
                />

                <div className="w-20 shrink-0 pt-0.5 text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">
                  {TYPE_LABEL[m.type]}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-[14px] tracking-[-0.005em]",
                        isUnread
                          ? "font-semibold text-foreground"
                          : "font-medium text-foreground/80"
                      )}
                    >
                      {m.title}
                    </span>
                    {status.kind === "action" && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-destructive">
                        <AlertCircle className="h-2.5 w-2.5" />
                        Action
                      </span>
                    )}
                    {status.kind === "awaiting" && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-warning">
                        <Clock className="h-2.5 w-2.5" />
                        Awaiting
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-1 line-clamp-1 text-[12.5px] transition-colors",
                      isOpen ? "text-muted-foreground/60" : "text-muted-foreground"
                    )}
                  >
                    {m.body}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {relativeTime(m.sentAt)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="slide-up-in overflow-hidden pl-[104px] pr-2 pb-6">
                  <div className="rounded-xl border border-border bg-surface-muted/40 p-5">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">From Candor</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{m.sentBy}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>
                        {new Date(m.sentAt).toLocaleString("en", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="mt-3 font-serif text-[16px] leading-[1.55] text-foreground">
                      {m.body}
                    </p>

                    <div className="mt-5">
                      {actions.length === 0 ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-[11.5px] text-muted-foreground ring-1 ring-border">
                          <Check className="h-3 w-3" />
                          No action required
                        </div>
                      ) : effectiveResponse ? (
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11.5px] font-medium text-background">
                            <Check className="h-3 w-3" />
                            You responded: {effectiveResponse.response}
                          </span>
                          {effectiveResponse.note && (
                            <span className="text-[11.5px] italic text-muted-foreground">
                              "{effectiveResponse.note}"
                            </span>
                          )}
                        </div>
                      ) : (
                        <ActionButtons
                          actions={actions}
                          onRespond={(id, note) => respond(m.id, id, note)}
                          queryDraft={queryDraft[m.id] || ""}
                          setQueryDraft={(v) =>
                            setQueryDraft((prev) => ({ ...prev, [m.id]: v }))
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}

        {visible.length === 0 && (
          <li className="py-16 text-center">
            <p className="font-serif text-[18px] italic text-muted-foreground">
              Nothing here.
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground/70">
              Try another filter — or enjoy the quiet.
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}

function ActionButtons({ actions, onRespond, queryDraft, setQueryDraft }) {
  const [showQuery, setShowQuery] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => {
              if (a.prompt) {
                setShowQuery((v) => !v);
              } else {
                onRespond(a.id);
              }
            }}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-medium transition-transform duration-150 hover:-translate-y-[1px]",
              a.tone === "primary"
                ? "bg-foreground text-background"
                : "border border-border bg-background text-foreground hover:border-border-strong"
            )}
          >
            {a.label}
          </button>
        ))}
      </div>

      {showQuery && (
        <div className="slide-up-in space-y-2 rounded-lg border border-border bg-background p-3">
          <label className="block text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
            Your query
          </label>
          <textarea
            autoFocus
            value={queryDraft}
            onChange={(e) => setQueryDraft(e.target.value)}
            rows={2}
            placeholder="What's unclear? Your booker will reply."
            className="w-full resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowQuery(false);
                setQueryDraft("");
              }}
              className="text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!queryDraft.trim()}
              onClick={() => onRespond("Query", queryDraft.trim())}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-[12px] font-medium text-background transition-opacity disabled:opacity-30"
            >
              Send query
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
