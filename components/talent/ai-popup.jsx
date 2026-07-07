"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Sparkles, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRail } from "./rail-context";

const SUGGESTED = [
  "When is my next booking?",
  "How much am I owed?",
  "What castings are open right now?",
  "What did I earn this year?",
];

const SEED_MESSAGES = [
  {
    role: "ai",
    text: "Hi — I can answer questions about your bookings, payments, schedule, and open castings. What's on your mind?",
  },
];

export function TalentAiPopup() {
  const { aiOpen, closeAi } = useRail();
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const panelRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!aiOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeAi();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aiOpen, closeAi]);

  useEffect(() => {
    if (aiOpen) scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [aiOpen, messages.length]);

  const send = async (text) => {
    const body = text?.trim();
    if (!body || thinking) return;
    setMessages((prev) => [...prev, { role: "talent", text: body }]);
    setDraft("");
    setThinking(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: body }),
      });
      const json = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            json.reply ??
            json.error ??
            "Something went sideways — try again in a moment.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "I couldn't reach the server — try again in a moment." },
      ]);
    } finally {
      setThinking(false);
    }
  };

  if (!aiOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <button
        type="button"
        aria-label="Close Ask Candor"
        onClick={closeAi}
        className="absolute inset-0 bg-background/40 backdrop-blur-[6px] transition-opacity duration-300 animate-in fade-in"
      />

      <div
        ref={panelRef}
        className={cn(
          "relative flex h-[560px] w-[min(520px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_-20px_oklch(0_0_0/0.3)]",
          "slide-up-in"
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
            <Sparkles className="h-3.5 w-3.5" />
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[15px] italic leading-tight text-foreground">
              Ask Candor
            </div>
            <div className="text-[11px] text-muted-foreground">
              Your AI booking assistant · reads your data, doesn't share it
            </div>
          </div>
          <button
            type="button"
            onClick={closeAi}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2",
                m.role === "talent" ? "justify-end" : "justify-start"
              )}
            >
              {m.role === "ai" && (
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <Sparkles className="h-3 w-3" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed slide-up-in",
                  m.role === "talent"
                    ? "rounded-br-md bg-foreground text-background"
                    : "rounded-bl-md bg-surface-muted text-foreground"
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-2">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                <Sparkles className="h-3 w-3" />
              </div>
              <div className="rounded-2xl rounded-bl-md bg-surface-muted px-3.5 py-2.5 text-[13px] text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="dot-pulse inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                  Thinking…
                </span>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="border-t border-border px-5 pt-3 pb-1">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">
              Try asking
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="group inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-foreground"
                >
                  {s}
                  <ArrowUpRight className="h-3 w-3 translate-x-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex items-center gap-2 border-t border-border px-4 py-3"
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about bookings, payments, schedule…"
            className="h-9 flex-1 bg-transparent px-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-opacity duration-200 disabled:opacity-30"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
