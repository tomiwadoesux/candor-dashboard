"use client";

import { useEffect, useRef, useState } from "react";
import { X, ArrowUp, Sparkles } from "lucide-react";
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

export function TypingDots({ className }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current opacity-40"
          style={{
            animation: "typing-dot 1.2s ease-in-out infinite",
            animationDelay: `${i * 160}ms`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes typing-dot {
          0%, 60%, 100% {
            opacity: 0.35;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          span {
            animation: none !important;
          }
        }
      `}</style>
    </span>
  );
}

export function TalentAiPopup() {
  const { aiOpen, closeAi } = useRail();
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
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
        className="absolute inset-0 bg-background/40 backdrop-blur-[6px]"
      />

      <div className="slide-up-in relative flex h-[560px] w-[min(520px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-pop)]">
        <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-brand-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold leading-tight text-foreground">
              Ask Candor
            </div>
            <div className="text-[11.5px] text-muted-foreground">
              Reads your bookings and payments — never shares them
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

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                m.role === "talent" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "bubble bubble-enter",
                  m.role === "talent" ? "bubble-out" : "bubble-in"
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="bubble bubble-in bubble-enter text-muted-foreground">
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="px-5 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="pressable inline-flex items-center rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand"
                >
                  {s}
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
          className="border-t border-border p-3"
        >
          <div className="flex items-center gap-2 rounded-xl border border-input bg-surface px-2 py-1.5 transition-[border-color,box-shadow] duration-140 ease-[var(--ease-out)] focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-ring">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about bookings, payments, schedule…"
              className="h-8 flex-1 bg-transparent px-1.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || thinking}
              aria-label="Send"
              className="pressable flex h-7 w-7 items-center justify-center rounded-full bg-brand text-brand-foreground transition-opacity duration-150 hover:bg-brand-hover disabled:opacity-30"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
