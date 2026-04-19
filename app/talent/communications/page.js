"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMe, useTeam, useThreads } from "@/lib/store";
import { ThreadView } from "@/components/talent/communications/thread-view";
import { NewThreadModal } from "@/components/talent/communications/new-thread-modal";

function fmtShort(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60);
  if (diff < 1) return "just now";
  if (diff < 24) return `${Math.floor(diff)}h`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function CommunicationsInner() {
  const me = useMe();
  const team = useTeam();
  const threads = useThreads();
  const search = useSearchParams();
  const [activeId, setActiveId] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDefaultTo, setComposerDefaultTo] = useState(null);
  const [q, setQ] = useState("");

  const myThreads = useMemo(
    () =>
      threads
        .filter((t) => t.talentId === me?.id)
        .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt)),
    [threads, me]
  );

  useEffect(() => {
    const to = search.get("to");
    const tid = search.get("thread");
    if (tid) {
      setActiveId(tid);
      return;
    }
    if (to) {
      setComposerDefaultTo(to);
      setComposerOpen(true);
    }
  }, [search]);

  useEffect(() => {
    if (!activeId && myThreads[0]) setActiveId(myThreads[0].id);
  }, [myThreads, activeId]);

  const active = myThreads.find((t) => t.id === activeId);
  const teamById = useMemo(() => {
    const map = {};
    team.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [team]);

  const filtered = myThreads.filter((t) => {
    if (!q) return true;
    const haystack = `${t.subject} ${t.messages.map((m) => m.body).join(" ")}`.toLowerCase();
    return haystack.includes(q.toLowerCase());
  });

  return (
    <>
      <div className="mt-8 grid min-h-[640px] grid-cols-12 overflow-hidden rounded-xl border border-border bg-background">
        <div className="col-span-12 flex flex-col border-r border-border md:col-span-4 lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-border/60 px-3 py-3">
            <div className="flex h-8 flex-1 items-center gap-2 rounded-md border border-border bg-surface-muted px-2">
              <Search className="h-3 w-3 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search threads"
                className="h-full w-full bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setComposerDefaultTo(null);
                setComposerOpen(true);
              }}
              aria-label="New communication"
              className="inline-flex h-8 items-center gap-1 rounded-md bg-foreground px-2.5 text-[12px] font-medium text-background transition-colors hover:bg-foreground/92"
            >
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-5 py-10 text-center text-[12px] text-muted-foreground">
                No threads yet.
              </li>
            )}
            {filtered.map((t) => {
              const other =
                t.createdByKind === "admin"
                  ? teamById[t.createdById]
                  : teamById[t.toId];
              const last = t.messages[t.messages.length - 1];
              const lastAuthor =
                last?.authorKind === "admin" ? teamById[last.authorId] : me;
              const isActive = t.id === activeId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    className={cn(
                      "group flex w-full items-start gap-3 border-b border-border/50 px-3 py-3 text-left transition-colors hover:bg-surface-muted/60",
                      isActive && "bg-surface-muted"
                    )}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-medium text-background"
                      style={{ backgroundColor: other?.accent || "#111" }}
                    >
                      {other?.avatar || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[12.5px] font-medium text-foreground">
                          {other?.short || "Candor"}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                          {fmtShort(t.lastAt)}
                        </span>
                      </div>
                      <div className="truncate font-serif text-[12.5px] italic text-foreground/90">
                        {t.subject}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        <span className="text-muted-foreground/60">
                          {lastAuthor?.short || "You"}:
                        </span>{" "}
                        {last?.body}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          <ThreadView thread={active} />
        </div>
      </div>

      <NewThreadModal
        open={composerOpen}
        onClose={(res) => {
          setComposerOpen(false);
          if (res?.threadId) setActiveId(res.threadId);
        }}
        defaultTo={composerDefaultTo}
      />
    </>
  );
}

export default function CommunicationsPage() {
  return (
    <div>
      <div className="flex items-baseline justify-between pb-2 pt-2">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Dashboard · Communications
        </div>
        <div className="text-[11px] text-muted-foreground">
          Threaded with the board — beats WhatsApp.
        </div>
      </div>
      <h1 className="font-serif text-[38px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        <span className="editorial-italic">Communications</span>
      </h1>
      <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-muted-foreground">
        Start a thread with any member of the Candor team. Pick a subject,
        the right manager, and reply as long as you need. React to any message.
      </p>

      <Suspense fallback={<div className="mt-8 h-[640px] rounded-xl border border-border bg-surface-muted/30" />}>
        <CommunicationsInner />
      </Suspense>

      <div className="mt-20 border-t border-border pt-6">
        <p className="font-serif text-[12.5px] italic text-muted-foreground">
          Candor Management Agency · Lagos · London · USA
        </p>
      </div>
    </div>
  );
}
