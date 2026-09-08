"use client";

import { useRef, useState } from "react";
import { ArrowBendUpLeft, Trash } from "@phosphor-icons/react";

/*
  Swipe gestures for the feed.

  Messages: drag right to reply, drag left to pull out a reaction tray that
  latches open so you can actually tap one. Open calls: drag either way to
  throw the card off the list.

  Pointer events, so a mouse drag behaves the same as a finger. The axis is
  decided on the first few pixels of movement — anything more vertical than
  horizontal is handed straight back to the scroller.
*/

const COMMIT = 68; // px of travel before a swipe counts
const TRAY = 196; // how far the card latches open over the reactions
const REACTIONS = ["👍", "❤️", "🔥", "👀", "✅"];

function useSwipe({ min, max, onEnd }) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const live = useRef(0);
  const start = useRef(null);

  function apply(value) {
    live.current = value;
    setOffset(value);
  }

  const handlers = {
    onPointerDown(event) {
      // Never hijack a press that belongs to a control inside the card.
      if (event.target.closest?.("button,a,input,textarea,select,iframe")) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      start.current = {
        x: event.clientX,
        y: event.clientY,
        base: live.current,
        axis: null,
        id: event.pointerId,
      };
    },

    onPointerMove(event) {
      const s = start.current;
      if (!s) return;
      const dx = event.clientX - s.x;
      const dy = event.clientY - s.y;

      if (!s.axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) >= Math.abs(dx)) {
          start.current = null; // vertical — let the feed scroll
          return;
        }
        s.axis = "x";
        try {
          event.currentTarget.setPointerCapture(s.id);
        } catch {}
        setDragging(true);
      }

      apply(Math.max(min, Math.min(max, s.base + dx)));
    },

    onPointerUp(event) {
      const s = start.current;
      start.current = null;
      if (!s || s.axis !== "x") return;
      try {
        event.currentTarget.releasePointerCapture(s.id);
      } catch {}
      setDragging(false);
      onEnd(live.current, apply);
    },

    onPointerCancel() {
      start.current = null;
      setDragging(false);
      apply(0);
    },
  };

  return { offset, dragging, apply, handlers };
}

/* Messages: right = reply, left = reaction tray */
export function SwipeActions({ onReply, onReact, children }) {
  const { offset, dragging, apply, handlers } = useSwipe({
    min: -TRAY - 28,
    max: 132,
    onEnd: (current, set) => {
      if (current >= COMMIT) {
        onReply();
        set(0);
      } else if (current <= -COMMIT) {
        set(-TRAY); // latch open so the emoji are tappable
      } else {
        set(0);
      }
    },
  });

  const trayOpen = offset <= -TRAY * 0.8;

  return (
    <div className="relative" style={{ touchAction: "pan-y" }} {...handlers}>
      {/* Reply, revealed from the left */}
      <div
        aria-hidden={offset <= 8}
        style={{ opacity: offset > 8 ? Math.min(1, offset / COMMIT) : 0 }}
        className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2.5 pl-4"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground">
          <ArrowBendUpLeft size={16} weight="bold" />
        </span>
        <span className="text-[11.5px] font-medium text-muted-foreground">Reply</span>
      </div>

      {/* Reactions, revealed from the right */}
      <div
        style={{
          opacity: offset < -8 ? Math.min(1, -offset / (TRAY * 0.55)) : 0,
          pointerEvents: trayOpen ? "auto" : "none",
        }}
        className="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-3"
      >
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`React ${emoji}`}
            onClick={() => {
              onReact(emoji);
              apply(0);
            }}
            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface text-[15px] shadow-2xs transition-transform duration-140 ease-[var(--ease-out)] hover:scale-115 active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div
        style={{
          transform: `translate3d(${offset}px,0,0)`,
          transition: dragging ? "none" : "transform 260ms var(--ease-out)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* Open calls: either direction throws the card away */
export function SwipeDismiss({ onDismiss, children }) {
  const [flying, setFlying] = useState(false);
  const { offset, dragging, apply, handlers } = useSwipe({
    min: -600,
    max: 600,
    onEnd: (current, set) => {
      if (Math.abs(current) >= COMMIT * 1.3) {
        setFlying(true);
        set(Math.sign(current) * 600);
        window.setTimeout(onDismiss, 220);
      } else {
        set(0);
      }
    },
  });

  const progress = Math.min(1, Math.abs(offset) / (COMMIT * 1.3));

  return (
    <div className="relative" style={{ touchAction: "pan-y" }} {...handlers}>
      <div
        style={{ opacity: progress }}
        className="pointer-events-none absolute inset-0 flex items-center justify-between rounded-2xl border border-dashed border-destructive/40 bg-destructive/[0.05] px-5 text-destructive"
      >
        <Trash size={17} weight="duotone" />
        <span className="text-[11.5px] font-medium">Dismiss</span>
        <Trash size={17} weight="duotone" />
      </div>

      <div
        style={{
          transform: `translate3d(${offset}px,0,0)`,
          opacity: flying ? 0 : 1 - progress * 0.2,
          transition: dragging
            ? "none"
            : "transform 220ms var(--ease-out), opacity 220ms linear",
        }}
      >
        {children}
      </div>
    </div>
  );
}
