"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowUp,
  Check,
  ChevronDown,
  Megaphone,
  PenLine,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { statusLabel, timeShort, relativeTime } from "@/lib/format";
import { dayKey, dayLabel } from "@/lib/chat-format";
import { sendNotification } from "@/lib/actions/notifications";
import { ComposeForm } from "./compose-notification";

const TYPES = [
  "general",
  "availability_check",
  "booking_update",
  "portfolio_request",
  "payment_update",
  "pre_job_brief",
];

const RESPONSE_TYPES = new Set([
  "availability_check",
  "booking_update",
  "portfolio_request",
  "pre_job_brief",
]);

const RESPONSE_LABEL = {
  accepted: "Accepted",
  declined: "Declined",
  confirmed: "Confirmed",
  queried: "Query",
};

function responseTone(status) {
  switch (status) {
    case "accepted":
    case "confirmed":
      return "text-success";
    case "declined":
      return "text-destructive";
    case "queried":
      return "text-warning";
    default:
      return "text-muted-foreground";
  }
}

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const BROADCAST_ID = "__broadcast__";

export function AdminMessenger({ notifications, talent }) {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  // Optimistic sends per conversation, cleared when the server list catches up.
  const [drafts, setDrafts] = useState([]);

  const conversations = useMemo(() => {
    const map = new Map();
    const ensure = (id, name, isBroadcast = false) => {
      if (!map.has(id)) {
        map.set(id, {
          id,
          name,
          isBroadcast,
          items: [],
          awaiting: 0,
          escalated: 0,
          lastAt: null,
          lastPreview: "",
        });
      }
      return map.get(id);
    };

    const sorted = [...notifications].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    for (const n of sorted) {
      const recipients = n.recipients || [];
      const isBroadcast = !n.talent && recipients.length > 0;
      const conv = isBroadcast
        ? ensure(BROADCAST_ID, "Roster broadcasts", true)
        : ensure(
            n.talent?.id ?? "unknown",
            n.talent ? `${n.talent.first_name} ${n.talent.last_name}` : "Unknown"
          );

      conv.items.push({ kind: "out", at: n.created_at, n });
      conv.lastAt = n.created_at;
      conv.lastPreview = n.body;

      if (isBroadcast) {
        const pending = recipients.filter(
          (r) => n.requires_response && r.response_status === "pending"
        ).length;
        conv.awaiting += pending;
      } else if (n.requires_response) {
        if (n.response_status === "pending") {
          conv.awaiting += 1;
        } else {
          const at = n.responded_at ?? n.created_at;
          conv.items.push({ kind: "in", at, n });
          if (new Date(at) > new Date(conv.lastAt ?? 0)) {
            conv.lastAt = at;
            conv.lastPreview =
              n.response_text ||
              RESPONSE_LABEL[n.response_status] ||
              statusLabel(n.response_status);
          }
        }
      }
      if (n.escalated) conv.escalated += 1;
    }

    for (const d of drafts) {
      const conv = map.get(d.convId);
      if (conv) {
        conv.items.push({ kind: "out", at: d.at, n: d.n, draft: true });
        conv.lastAt = d.at;
        conv.lastPreview = d.n.body;
      }
    }

    for (const conv of map.values()) {
      conv.items.sort((a, b) => new Date(a.at) - new Date(b.at));
    }

    return [...map.values()].sort(
      (a, b) => new Date(b.lastAt ?? 0) - new Date(a.lastAt ?? 0)
    );
  }, [notifications, drafts]);

  const visible = conversations.filter((c) => {
    if (filter === "awaiting") return c.awaiting > 0;
    if (filter === "escalated") return c.escalated > 0;
    return true;
  });

  const selected =
    conversations.find((c) => c.id === selectedId) ?? visible[0] ?? null;

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-2xl border border-border bg-card">
      {/* Conversation list */}
      <div className="flex w-[280px] shrink-0 flex-col border-r border-border">
        <div className="flex items-center gap-1 border-b border-border p-3">
          {[
            { id: "all", label: "All" },
            { id: "awaiting", label: "Awaiting" },
            { id: "escalated", label: "Escalated" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={cn(
                "pressable h-7 rounded-full px-2.5 text-[12px] font-medium transition-colors",
                filter === t.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            aria-label="New message"
            className="pressable ml-auto grid h-7 w-7 place-items-center rounded-lg bg-brand text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            <PenLine className="h-3.5 w-3.5" />
          </button>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
          {visible.length === 0 && (
            <li className="px-3 py-10 text-center text-[12.5px] text-muted-foreground">
              {filter === "all"
                ? "No conversations yet."
                : "Nothing in this view."}
            </li>
          )}
          {visible.map((c) => {
            const active = selected?.id === c.id && !composeOpen;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(c.id);
                    setComposeOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-140",
                    active ? "bg-surface-muted" : "hover:bg-surface-muted/60"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                      c.isBroadcast
                        ? "bg-brand-soft text-brand-soft-foreground"
                        : "bg-surface-muted text-foreground ring-1 ring-border"
                    )}
                  >
                    {c.isBroadcast ? <Megaphone className="h-3.5 w-3.5" /> : initials(c.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[13px] font-medium text-foreground">
                        {c.name}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60">
                        {c.lastAt ? relativeTime(c.lastAt) : ""}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      <span className="line-clamp-1 flex-1 text-[12px] text-muted-foreground">
                        {c.lastPreview}
                      </span>
                      {c.escalated > 0 && (
                        <AlertTriangle className="h-3 w-3 shrink-0 text-destructive" />
                      )}
                      {c.awaiting > 0 && (
                        <span
                          data-slot="numeric"
                          className="flex h-[17px] min-w-[17px] shrink-0 items-center justify-center rounded-full bg-warning/15 px-1 text-[10px] font-semibold text-warning"
                        >
                          {c.awaiting}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right pane */}
      <div className="flex min-w-0 flex-1 flex-col">
        {composeOpen ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-foreground">
                New message
              </h3>
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                aria-label="Close composer"
                className="pressable grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <ComposeForm talent={talent} onSent={() => setComposeOpen(false)} />
          </div>
        ) : selected ? (
          <Thread
            key={selected.id}
            conversation={selected}
            onSent={(draft) => setDrafts((prev) => [...prev, draft])}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <p className="text-[14px] font-medium text-foreground">No conversation selected</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Pick a talent on the left, or start a new message.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Thread({ conversation: c, onSent }) {
  const [draft, setDraft] = useState("");
  const [type, setType] = useState("general");
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef(null);

  const count = c.items.length;
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count]);

  const timeline = useMemo(() => {
    const rows = [];
    let lastDay = null;
    for (const item of c.items) {
      const k = dayKey(item.at);
      if (k !== lastDay) {
        rows.push({ kind: "day", at: item.at, key: `day-${k}` });
        lastDay = k;
      }
      rows.push({ ...item, key: `${item.kind}-${item.n.id}-${item.at}` });
    }
    return rows;
  }, [c.items]);

  const send = () => {
    const body = draft.trim();
    if (!body || c.isBroadcast) return;
    setError(null);
    const fd = new FormData();
    fd.append("talentIds", c.id);
    fd.append("type", type);
    fd.append("title", body.length > 64 ? `${body.slice(0, 61)}…` : body);
    fd.append("body", body);
    startTransition(async () => {
      const result = await sendNotification(undefined, fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onSent({
        convId: c.id,
        at: new Date().toISOString(),
        n: {
          id: `draft-${Math.random().toString(36).slice(2)}`,
          type,
          title: "",
          body,
          requires_response: RESPONSE_TYPES.has(type),
          response_status: "pending",
          sender: null,
        },
      });
      setDraft("");
      setType("general");
    });
  };

  return (
    <>
      {/* Thread header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold",
            c.isBroadcast
              ? "bg-brand-soft text-brand-soft-foreground"
              : "bg-surface-muted text-foreground ring-1 ring-border"
          )}
        >
          {c.isBroadcast ? <Megaphone className="h-3.5 w-3.5" /> : initials(c.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-semibold text-foreground">
            {c.name}
          </div>
          <div className="text-[11.5px] text-muted-foreground">
            {c.awaiting > 0
              ? `${c.awaiting} awaiting a reply`
              : c.isBroadcast
                ? "Announcements to the whole roster"
                : "All caught up"}
          </div>
        </div>
        {c.escalated > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {c.escalated} escalated
          </span>
        )}
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-5 py-4 [scrollbar-gutter:stable]"
      >
        {timeline.map((row) => {
          if (row.kind === "day") {
            return (
              <div key={row.key} className="flex justify-center py-2.5">
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {dayLabel(row.at)}
                </span>
              </div>
            );
          }

          if (row.kind === "in") {
            const n = row.n;
            const isQuery = n.response_status === "queried" && n.response_text;
            return (
              <div key={row.key} className="flex items-end gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-muted text-[10px] font-semibold text-foreground ring-1 ring-border">
                  {initials(c.name)}
                </span>
                <div className="flex max-w-[min(80%,28rem)] flex-col gap-1">
                  <div className="bubble bubble-in">
                    {isQuery ? (
                      <span className="whitespace-pre-line">{n.response_text}</span>
                    ) : (
                      <>
                        <span
                          className={cn(
                            "whitespace-nowrap font-medium",
                            responseTone(n.response_status)
                          )}
                        >
                          <Check className="mr-1 inline-block h-3.5 w-3.5 align-[-2px]" />
                          {RESPONSE_LABEL[n.response_status] ?? statusLabel(n.response_status)}
                        </span>
                        <span className="text-muted-foreground"> — {n.title}</span>
                      </>
                    )}
                  </div>
                  <span className="px-1 font-mono text-[10.5px] text-muted-foreground/60">
                    {timeShort(row.at)}
                  </span>
                </div>
              </div>
            );
          }

          // Outgoing (agency) message
          const n = row.n;
          const awaiting = n.requires_response && n.response_status === "pending";
          return (
            <div key={row.key} className={cn("flex justify-end", row.draft && "opacity-80")}>
              <div className="flex max-w-[min(80%,28rem)] flex-col items-end gap-1">
                <div className="bubble bubble-out">
                  {n.title && n.title !== n.body && (
                    <div className="mb-0.5 font-semibold">{n.title}</div>
                  )}
                  <span className="whitespace-pre-line">{n.body}</span>
                </div>
                <span className="flex items-center gap-1.5 px-1 font-mono text-[10.5px] text-muted-foreground/60">
                  {n.type !== "general" && <span>{statusLabel(n.type)} ·</span>}
                  {n.sender?.full_name && <span>{n.sender.full_name} ·</span>}
                  {timeShort(row.at)}
                  {awaiting && !c.isBroadcast && (
                    <span className="font-sans font-medium text-warning">· awaiting reply</span>
                  )}
                  {n.escalated && (
                    <span className="font-sans font-medium text-destructive">· escalated</span>
                  )}
                </span>
                {c.isBroadcast && (n.recipients || []).length > 0 && (
                  <RecipientSummary n={n} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      {!c.isBroadcast && (
        <div className="border-t border-border p-3">
          {error && (
            <p className="mb-2 inline-flex items-center gap-1.5 px-1 text-[12px] text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
          <div className="flex items-end gap-2 rounded-2xl border border-input bg-surface px-3 py-2 transition-[border-color,box-shadow] duration-140 ease-[var(--ease-out)] focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-ring">
            <label className="relative mb-0.5 inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-surface-muted py-1 pl-2.5 pr-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                aria-label="Message type"
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {statusLabel(t)}
                  </option>
                ))}
              </select>
              {statusLabel(type)}
              <ChevronDown className="h-3 w-3" />
            </label>
            <textarea
              rows={1}
              value={draft}
              disabled={pending}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Message ${c.name.split(" ")[0]}…`}
              className="max-h-32 min-h-[28px] flex-1 resize-none bg-transparent py-0.5 text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={send}
              disabled={pending || !draft.trim()}
              aria-label="Send"
              className="pressable flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground transition-[opacity,background-color] duration-150 hover:bg-brand-hover disabled:opacity-30"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          {RESPONSE_TYPES.has(type) && (
            <p className="mt-1.5 px-1 text-[11px] text-muted-foreground/60">
              {statusLabel(type)} asks for a response — it escalates after 10 quiet hours.
            </p>
          )}
        </div>
      )}
    </>
  );
}

function RecipientSummary({ n }) {
  const [open, setOpen] = useState(false);
  const recipients = n.recipients || [];
  const responded = recipients.filter((r) => r.response_status !== "pending");
  const read = recipients.filter((r) => r.is_read);

  return (
    <div className="w-full max-w-[min(80%,28rem)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {n.requires_response
          ? `${responded.length}/${recipients.length} responded`
          : `${read.length}/${recipients.length} read`}
        <ChevronDown
          className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul className="slide-up-in mt-1.5 space-y-1 rounded-xl border border-border bg-surface px-3 py-2.5">
          {recipients.map((r) => (
            <li key={r.id} className="flex items-baseline justify-between gap-3 text-[11.5px]">
              <span className="truncate text-foreground">
                {r.talent ? `${r.talent.first_name} ${r.talent.last_name}` : "—"}
              </span>
              <span className={cn("shrink-0 font-medium", responseTone(r.response_status))}>
                {n.requires_response
                  ? r.response_status === "pending"
                    ? "Pending"
                    : RESPONSE_LABEL[r.response_status] ?? statusLabel(r.response_status)
                  : r.is_read
                    ? "Read"
                    : "Unread"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
