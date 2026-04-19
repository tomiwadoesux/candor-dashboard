"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactionBar } from "./reaction-bar";
import { useActions, useMe, useTeam } from "@/lib/store";

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.toDateString() === now.toDateString();
  const opts = sameDay
    ? { hour: "numeric", minute: "2-digit" }
    : { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" };
  return d.toLocaleString("en-GB", opts);
}

function AuthorBadge({ author, kind, me, side }) {
  if (!author) return null;
  const isMe = kind === "talent" && me && author.id === me.id;
  return (
    <div className={cn("flex items-center gap-2", side === "right" && "flex-row-reverse")}>
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-background"
        style={{
          backgroundColor:
            kind === "admin" ? author.accent || "#111" : "oklch(20% 0 0)",
        }}
      >
        {author.avatar || author.stageName?.[0] || author.name?.[0]}
      </div>
      <div className={cn("min-w-0", side === "right" && "text-right")}>
        <div className="text-[12px] font-medium text-foreground">
          {isMe ? "You" : author.name || author.stageName}
        </div>
        <div className="text-[10.5px] text-muted-foreground">
          {kind === "admin" ? author.role : "Talent"}
        </div>
      </div>
    </div>
  );
}

export function ThreadView({ thread, onClose }) {
  const me = useMe();
  const team = useTeam();
  const { replyToThread, react } = useActions();
  const [draft, setDraft] = useState("");

  const lookup = useMemo(() => {
    const byId = {};
    team.forEach((t) => {
      byId[t.id] = t;
    });
    if (me) byId[me.id] = me;
    return byId;
  }, [team, me]);

  if (!thread) {
    return (
      <div className="flex h-full items-center justify-center py-20 text-center text-[12.5px] text-muted-foreground">
        Pick a thread to read.
      </div>
    );
  }

  const actorId = me?.id;

  function send() {
    if (!draft.trim() || !me) return;
    const now = new Date().toISOString();
    replyToThread(thread.id, {
      id: `m-${Date.now()}`,
      authorId: me.id,
      authorKind: "talent",
      body: draft.trim(),
      at: now,
      reactions: {},
    });
    setDraft("");
  }

  const messages = thread.messages || [];
  const first = messages[0];
  const replies = messages.slice(1);
  const firstAuthor = lookup[first?.authorId];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
            Thread · {thread.talentId === me?.id ? "You" : "Talent"}
          </div>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-[24px] font-light italic leading-tight text-foreground">
            {thread.subject}
          </h2>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
            {fmtTime(thread.lastAt)}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {first && (
          <article>
            <div className="flex items-start justify-between gap-3">
              <AuthorBadge author={firstAuthor} kind={first.authorKind} me={me} />
              <div className="shrink-0 font-mono text-[10.5px] text-muted-foreground">
                {fmtTime(first.at)}
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-border bg-surface-muted/40 p-4">
              <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground">
                {first.body}
              </p>
              <div className="mt-3 border-t border-border/60 pt-2">
                <ReactionBar
                  reactions={first.reactions}
                  actorId={actorId}
                  onToggle={(kind) =>
                    react(thread.id, first.id, kind, actorId)
                  }
                />
              </div>
            </div>
          </article>
        )}

        {replies.length > 0 && (
          <div className="relative mt-5 pl-6 before:absolute before:left-[9px] before:top-0 before:bottom-0 before:w-px before:bg-border/60">
            {replies.map((m, idx) => {
              const author = lookup[m.authorId];
              const last = idx === replies.length - 1;
              const prev = replies[idx - 1];
              const isRoot = idx === 0;
              return (
                <div key={m.id} className={cn("relative", idx > 0 && "mt-4")}>
                  <span
                    aria-hidden
                    className="absolute -left-[24px] top-4 h-px w-5 bg-border/60"
                  />
                  <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                    <CornerDownRight className="h-3 w-3 text-muted-foreground/60" />
                    <AuthorBadge author={author} kind={m.authorKind} me={me} />
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">
                      {fmtTime(m.at)}
                    </span>
                  </div>
                  <div className="mt-2 rounded-md border border-border bg-background p-3">
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                      {m.body}
                    </p>
                    <div className="mt-2 border-t border-border/60 pt-1.5">
                      <ReactionBar
                        reactions={m.reactions}
                        actorId={actorId}
                        onToggle={(kind) => react(thread.id, m.id, kind, actorId)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border/60 px-6 py-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="Write a reply…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
          className="w-full resize-none rounded-md border border-border bg-surface-muted/60 px-3 py-2 text-[13px] leading-relaxed text-foreground outline-none transition-colors focus:border-border-strong"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="text-[10.5px] text-muted-foreground">
            ⌘ + Enter to send
          </div>
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim()}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-foreground px-3 text-[12px] font-medium text-background transition-colors hover:bg-foreground/92 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reply <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
