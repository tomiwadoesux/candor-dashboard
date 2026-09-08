"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  Paperclip,
  FilePdf,
  ImageSquare,
  PaperPlaneTilt,
  PencilSimple,
  Heart,
  ArrowBendUpLeft,
  X,
  Eye,
  WarningCircle,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { OpenCallCard } from "./open-call-card";
import { UrgentCard } from "./urgent-card";
import { SwipeActions, SwipeDismiss } from "./swipe";
import { ROSTER, TEAM_ORDER, initials } from "./roster";

const UNDO_MS = 4000;
// A fresh message defaults to your agent; a reply goes back to whoever wrote it.
const AGENT = ROSTER.find((person) => person.team === "Agent");

/*
  CARD FEED — one inbox, every sender in it, no bubbles, no inline composer.

  Everyone lands in the same column: agent, bookings, casting. A rule is
  drawn wherever the voice changes, and consecutive messages from one person
  stay grouped under a single header. Ordered by latest activity, newest at
  the top: what you send surfaces, but the message you answered stays put in
  its own conversation — the quote above your reply is the link back to it.

  Attachments are view-once and never leave the tab. Each file becomes a blob
  URL (URL.createObjectURL), and the first time it is opened we revoke that URL
  and drop the reference — the bytes are gone, not hidden. There is no database
  and no upload, so a refresh clears the whole feed. That is the design, not a
  gap: nothing durable is ever written.
*/

const MAX_BYTES = 25 * 1024 * 1024;

// Newest activity first. Only new messages surface; parents stay in place.
const SEED_POSTS = [
  {
    id: "call-1",
    type: "call",
    time: "11:40",
    title: "Zara SS27 lookbook — one spot just opened",
    detail: "Thu 14 Mar · 9am call · Shoreditch Studios · $2,400 day rate",
    recipients: ["imani", "naomi", "zara", "nia", "grace"],
    status: "open",
    declined: [],
  },
  {
    id: "seed-4",
    author: "Elise Moreau",
    role: "Casting · Bottega",
    time: "11:05",
    body: "Lovely to meet you at the callback yesterday.",
    attachments: [],
    reactions: 0,
    mine: false,
  },
  {
    id: "seed-5",
    author: "Elise Moreau",
    role: "Casting · Bottega",
    time: "11:06",
    body: "One thing — the client asked for a clean face on the day, so skip the lash extensions.",
    attachments: [],
    reactions: 1,
    mine: false,
  },
  {
    id: "seed-3",
    author: "Tunde Bakare",
    role: "Manager",
    time: "10:31",
    body: "Call sheet for Selfridges lands tonight. Nothing needed from you yet — just keep Saturday morning clear.",
    attachments: [],
    reactions: 0,
    mine: false,
  },
  {
    id: "seed-1",
    author: "Nadia Okonkwo",
    role: "Agent",
    time: "09:52",
    body: "Bottega confirmed the fitting for Tuesday. Bring the black heels from the Vogue shoot — they want to see the full look before Milan.",
    attachments: [],
    reactions: 2,
    mine: false,
  },
  {
    id: "seed-2",
    author: "You",
    role: null,
    time: "10:04",
    body: "Got it — I'll be there at 9am.",
    attachments: [],
    reactions: 0,
    mine: true,
    replyTo: {
      id: "seed-1",
      author: "Nadia Okonkwo",
      excerpt: "Bottega confirmed the fitting for Tuesday. Bring the black heels…",
    },
  },
  {
    id: "call-2",
    type: "call",
    time: "09:15",
    title: "Selfridges e-comm — two fittings, same day",
    detail: "Sat 16 Mar · 11am · Marylebone · $1,150 half day",
    recipients: "everyone",
    status: "claimed",
    claimedBy: "Imani Brooks",
    claimedAt: "09:18",
    seenBy: ["clara", "grace", "kemi", "lara", "naomi", "sade", "zara", "zoe"],
    declined: [],
  },
];

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function kindOf(file) {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "image";
  return null;
}

function clockNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------------------------------------- attachment */

function AttachmentChip({ attachment, onOpen }) {
  const { kind, name, size, spent } = attachment;
  const Icon = kind === "pdf" ? FilePdf : ImageSquare;

  if (spent) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border bg-surface-muted/50 px-3 py-2.5">
        <Icon size={17} className="shrink-0 text-muted-foreground/50" />
        <span className="truncate text-[11.5px] text-muted-foreground/60 line-through">
          {name}
        </span>
        <span className="ml-auto shrink-0 text-[10.5px] font-medium tracking-wide text-muted-foreground/70 uppercase">
          Opened · deleted
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-border-strong hover:bg-surface-muted"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-muted text-foreground">
        <Icon size={16} weight="duotone" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-medium text-foreground">
          {name}
        </span>
        <span className="block text-[10.5px] text-muted-foreground">
          {formatBytes(size)} · {kind === "pdf" ? "PDF" : "Image"}
        </span>
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-brand/10 px-2 py-1 text-[10px] font-semibold tracking-wide text-brand uppercase">
        <Eye size={11} weight="bold" />
        View once
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ modal */

function Viewer({ viewing, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!viewing) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-foreground/60 backdrop-blur-sm">
      <div className="flex shrink-0 items-center gap-3 px-5 py-3">
        <span className="flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-medium text-foreground">
          <WarningCircle size={13} weight="fill" className="text-brand" />
          Deleted when you close this
        </span>
        <span className="truncate text-[12px] text-background/90">{viewing.name}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close and delete"
          className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background/95 text-foreground transition-transform active:scale-90"
        >
          <X size={15} weight="bold" />
        </button>
      </div>

      <div className="min-h-0 flex-1 px-5 pb-5">
        {viewing.kind === "image" ? (
          <div className="grid h-full place-items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewing.url}
              alt={viewing.name}
              className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
            />
          </div>
        ) : (
          <iframe
            src={viewing.url}
            title={viewing.name}
            className="h-full w-full rounded-xl border-0 bg-background shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- feed */

export function CardFeed({ urgentMessage, onAcknowledge, onSeen, onDismissUrgent, cardGap, innerRadius }) {
  const gapStyle = cardGap != null ? (typeof cardGap === "number" ? `${cardGap}px` : cardGap) : "var(--card-gap, 16px)";
  const radiusStyle = innerRadius != null ? (typeof innerRadius === "number" ? `${innerRadius}px` : innerRadius) : "var(--inner-radius, 16px)";

  const [posts, setPosts] = useState(SEED_POSTS);
  const [composing, setComposing] = useState(false);
  const [body, setBody] = useState("");
  const [staged, setStaged] = useState([]);
  const [notice, setNotice] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [peopleQuery, setPeopleQuery] = useState("");
  const [dismissed, setDismissed] = useState([]);
  const [undo, setUndo] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const [picking, setPicking] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerIndex, setPickerIndex] = useState(0);
  const [emojiFor, setEmojiFor] = useState(null);
  const undoTimer = useRef(null);
  const flashTimer = useRef(null);
  const postRefs = useRef({});

  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  // Every blob URL we have handed out, so unmount can free the lot.
  const liveUrls = useRef(new Set());

  const createUrl = useCallback((file) => {
    const url = URL.createObjectURL(file);
    liveUrls.current.add(url);
    return url;
  }, []);

  const revoke = useCallback((url) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    liveUrls.current.delete(url);
  }, []);

  // Nothing outlives the component — leaving the tab frees every blob.
  useEffect(() => {
    const urls = liveUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const addFiles = useCallback(
    (fileList) => {
      const accepted = [];
      const rejected = [];

      for (const file of Array.from(fileList)) {
        const kind = kindOf(file);
        if (!kind) {
          rejected.push(`${file.name} — images and PDFs only`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          rejected.push(`${file.name} — over ${formatBytes(MAX_BYTES)}`);
          continue;
        }
        accepted.push({
          id: crypto.randomUUID(),
          name: file.name,
          kind,
          size: file.size,
          url: createUrl(file),
          spent: false,
        });
      }

      if (accepted.length) {
        setStaged((prev) => [...prev, ...accepted]);
        setComposing(true);
      }
      setNotice(rejected.length ? rejected.join(" · ") : null);
    },
    [createUrl],
  );

  function unstage(id) {
    setStaged((prev) => {
      const hit = prev.find((a) => a.id === id);
      revoke(hit?.url);
      return prev.filter((a) => a.id !== id);
    });
  }

  function discardDraft() {
    staged.forEach((a) => revoke(a.url));
    setStaged([]);
    setBody("");
    setNotice(null);
    setComposing(false);
    setReplyTo(null);
    setRecipient(null);
    setPicking(false);
  }

  function publish() {
    const text = body.trim();
    if (!text && !staged.length) return;

    const sent = {
      id: crypto.randomUUID(),
      author: "You",
      role: null,
      time: clockNow(),
      body: text,
      attachments: staged,
      reactions: 0,
      mine: true,
      replyTo: replyTo ?? null,
      to: replyTo ? replyTo.author : sendingTo,
    };

    // Only what you just sent moves. The message being answered stays where
    // it sits in the conversation — the quote is the link back to it, so
    // there is no reason to tear it out of its own thread.
    setPosts((prev) => [sent, ...prev]);

    // Ownership moves to the post; don't revoke what we just handed over.
    setStaged([]);
    setBody("");
    setNotice(null);
    setComposing(false);
    setReplyTo(null);
    // The newest activity now sits at the top, so follow it there.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function openAttachment(postId, attachment) {
    setViewing({ postId, attId: attachment.id, ...attachment });
  }

  // Closing is the burn: revoke first, then mark the attachment spent.
  const closeViewer = useCallback(() => {
    if (!viewing) return;
    revoke(viewing.url);
    setPosts((prev) =>
      prev.map((post) =>
        post.id !== viewing.postId
          ? post
          : {
              ...post,
              attachments: post.attachments.map((a) =>
                a.id === viewing.attId ? { ...a, url: null, spent: true } : a,
              ),
            },
      ),
    );
    setViewing(null);
  }, [viewing, revoke]);

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
  }

  const canPost = body.trim().length > 0 || staged.length > 0;

  // Dismissal is only provisional until the undo window closes.
  function dismissCall(call) {
    setDismissed((prev) => [...prev, call.id]);
    setUndo({ id: call.id, title: call.title });
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), UNDO_MS);
  }

  function restoreCall() {
    if (!undo) return;
    clearTimeout(undoTimer.current);
    setDismissed((prev) => prev.filter((id) => id !== undo.id));
    setUndo(null);
  }

  useEffect(
    () => () => {
      clearTimeout(undoTimer.current);
      clearTimeout(flashTimer.current);
    },
    [],
  );

  function reactToPost(postId, emoji) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, reaction: p.reaction === emoji ? null : emoji } : p,
      ),
    );
  }

  function startReply(post) {
    setReplyTo({
      id: post.id,
      author: post.author,
      excerpt: (post.body ?? post.title ?? "").slice(0, 80),
    });
    setComposing(true);
  }

  // Clicking a quote walks you back to the message it came from.
  function jumpToPost(id) {
    const node = postRefs.current[id];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashId(id);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashId(null), 1400);
  }

  function toggleHeart(postId) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, hearted: !p.hearted } : p)),
    );
  }

  // A claim closes the call; a decline only takes you out of the running.
  function respondToCall(callId, answer) {
    setPosts((prev) =>
      prev.map((entry) => {
        if (entry.id !== callId || entry.type !== "call") return entry;
        if (answer === "available") {
          return {
            ...entry,
            status: "claimed",
            claimedBy: "You",
            claimedAt: clockNow(),
          };
        }
        const declined = new Set(entry.declined ?? []);
        if (answer === "unavailable") declined.add("zara");
        else declined.delete("zara");
        return { ...entry, declined: [...declined] };
      }),
    );
  }

  const visiblePosts = posts.filter((post) => !dismissed.includes(post.id));
  // Everyone who has actually said something, for the inbox header.
  const senders = [
    ...new Set(visiblePosts.filter((p) => p.type !== "call" && !p.mine).map((p) => p.author)),
  ];

  // People who have written to you but aren't on the talent roster —
  // bookers, casting. They belong in the rail too, or you can't answer them.
  const offRoster = [
    ...new Map(
      visiblePosts
        .filter((p) => p.type !== "call" && !p.mine && !ROSTER.some((r) => r.name === p.author))
        .map((p) => [p.author, { id: p.author, name: p.author, city: p.role, external: true }]),
    ).values(),
  ];

  const directory = [...offRoster, ...ROSTER.filter((p) => !p.you)].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const sendingTo = recipient?.name ?? AGENT.name;

  // The picker lives where the cursor already is, and answers to the keyboard,
  // so choosing a name never means a trip to the far side of the screen.
  const pq = pickerQuery.trim().toLowerCase();
  const pickerList = (
    pq
      ? directory.filter(
          (p) =>
            p.name.toLowerCase().includes(pq) ||
            (p.team ?? p.city ?? "").toLowerCase().includes(pq),
        )
      : directory
  ).sort((a, b) => {
    const rank = (p) => (p.team ? TEAM_ORDER.indexOf(p.team) : 99);
    return rank(a) - rank(b) || a.name.localeCompare(b.name);
  });

  function openPicker() {
    setPickerQuery("");
    setPickerIndex(0);
    setPicking(true);
  }

  function chooseRecipient(person) {
    setRecipient(person);
    setReplyTo(null);
    setPicking(false);
    setComposing(true);
  }

  function onPickerKey(event) {
    if (event.key === "Escape") return setPicking(false);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setPickerIndex((i) => Math.min(i + 1, pickerList.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setPickerIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && pickerList[pickerIndex]) {
      event.preventDefault();
      chooseRecipient(pickerList[pickerIndex]);
    }
  }

  const query = peopleQuery.trim().toLowerCase();
  const people = query
    ? directory.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.city ?? "").toLowerCase().includes(query),
      )
    : directory;

  // Manager, agent, MD pinned on top in that order; the rest stay alphabetical.
  const myTeam = TEAM_ORDER.map((role) => people.find((p) => p.team === role)).filter(Boolean);
  const everyoneElse = people.filter((p) => !p.team);

  return (
    <div
      className="relative flex h-full w-full"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setDragging(false);
      }}
      onDrop={onDrop}
    >
      <div className="relative flex min-w-0 w-full flex-1 flex-col">
        {/* Who this thread is with — every message has exactly one recipient */}
        <div
          style={{
            paddingLeft: gapStyle,
            paddingRight: gapStyle,
          }}
          className="shrink-0 border-b border-border/60 py-2.5"
        >
          <div className="flex w-full items-center gap-2.5">
            <div className="flex shrink-0 items-center">
              {senders.slice(0, 4).map((name, i) => (
                <span
                  key={name}
                  title={name}
                  style={{ zIndex: 4 - i }}
                  className="-ml-2 grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-muted text-[10px] font-semibold text-foreground ring-2 ring-surface first:ml-0"
                >
                  {initials(name)}
                </span>
              ))}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[12.5px] font-semibold text-foreground">
                All messages
              </p>
              <p className="truncate text-[10.5px] text-muted-foreground">
                {senders.length} {senders.length === 1 ? "person" : "people"} ·
                everything in one place
              </p>
            </div>
            <span className="ml-auto shrink-0 rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] text-muted-foreground">
              Nothing saved · clears on refresh
            </span>
          </div>
        </div>

        <div
          ref={scrollRef}
          style={{
            paddingLeft: gapStyle,
            paddingRight: gapStyle,
            paddingTop: gapStyle,
            paddingBottom: gapStyle,
          }}
          className="flex-1 overflow-y-auto"
        >
          <div className="w-full space-y-3">
          {urgentMessage && !dismissed.includes(urgentMessage.id) ? (
            <UrgentCard
              urgent={urgentMessage}
              onAcknowledge={onAcknowledge}
              onSeen={onSeen}
              onReply={() => startReply({ id: urgentMessage.id, author: urgentMessage.author })}
              onDismiss={() => {
                setDismissed((prev) => [...prev, urgentMessage.id]);
                onDismissUrgent?.();
              }}
              innerRadius={innerRadius}
            />
          ) : null}

          <div className="flex items-center gap-3 pb-1">
            <span className="h-px flex-1 bg-border/70" />
            <span className="text-[10.5px] font-medium tracking-wide text-muted-foreground uppercase">
              Today
            </span>
            <span className="h-px flex-1 bg-border/70" />
          </div>
          {visiblePosts.map((post, index) => {
            const prev = visiblePosts[index - 1];
            // A new voice in the inbox: show the header again and rule a line.
            const startsGroup =
              post.type === "call" ||
              !prev ||
              prev.type === "call" ||
              prev.author !== post.author;

            return (
            <Fragment key={post.id}>
            {index > 0 && startsGroup ? (
              <div aria-hidden className="h-px bg-border/70" />
            ) : null}
            {post.type === "call" ? (
              <SwipeDismiss onDismiss={() => dismissCall(post)}>
                <OpenCallCard call={post} onRespond={respondToCall} innerRadius={innerRadius} />
              </SwipeDismiss>
            ) : (
            <SwipeActions
              onReply={() => startReply(post)}
              onReact={(emoji) => reactToPost(post.id, emoji)}
            >
            {/* A message is flow, not a card — only actionable things get a box */}
            <div
              className="relative"
              ref={(node) => {
                postRefs.current[post.id] = node;
              }}
            >
              {post.replyTo ? (
                <>
                  {/* The line iMessage draws: up out of this reply, back to the original */}
                  <span
                    aria-hidden
                    className="absolute top-3 left-[22px] h-5 w-5 rounded-tl-[9px] border-t-2 border-l-2 border-border"
                  />
                  <button
                    type="button"
                    onClick={() => jumpToPost(post.replyTo.id)}
                    className="mb-0.5 ml-[52px] flex h-6 max-w-[440px] items-center gap-1.5 rounded-md px-1.5 text-[11px] transition-colors hover:bg-surface-muted"
                  >
                    <span className="shrink-0 font-medium text-muted-foreground">
                      {post.replyTo.author === "You" ? "You" : post.replyTo.author.split(" ")[0]}
                    </span>
                    <span className="truncate text-muted-foreground/70">
                      {post.replyTo.excerpt}
                    </span>
                  </button>
                </>
              ) : null}

            <article
              // Must stay fully opaque — the swipe tray sits directly behind it
              className={`group/post flex gap-3 rounded-xl px-2 py-2.5 transition-colors duration-300 ${
                flashId === post.id ? "bg-brand/10" : "bg-surface hover:bg-surface-muted"
              }`}
            >
              {startsGroup ? (
                <span
                  className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10.5px] font-semibold ${
                    post.mine
                      ? "bg-foreground text-background"
                      : "border border-border bg-surface-muted text-foreground"
                  }`}
                >
                  {initials(post.author === "You" ? "Zara Achebe" : post.author)}
                </span>
              ) : (
                /* Same person still talking — keep the column, drop the repetition */
                <span className="w-8 shrink-0" />
              )}

              <div className="min-w-0 flex-1">
                {startsGroup ? (
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-[12.5px] font-semibold text-foreground">
                    {post.author}
                  </span>
                  {post.role ? (
                    <span className="shrink-0 text-[10.5px] text-muted-foreground">
                      {post.role}
                    </span>
                  ) : null}
                  {post.mine && post.to && !post.replyTo ? (
                    <span className="shrink-0 text-[10.5px] text-muted-foreground">
                      → {post.to}
                    </span>
                  ) : null}
                  <span className="ml-auto shrink-0 text-[10.5px] tabular-nums text-muted-foreground">
                    {post.time}
                  </span>
                </div>
                ) : null}

                {post.body ? (
                  <p
                    className={`text-[13px] leading-relaxed whitespace-pre-wrap text-foreground ${
                      startsGroup ? "mt-1" : ""
                    }`}
                  >
                    {post.body}
                  </p>
                ) : null}

                {post.attachments.length ? (
                  <div className="mt-2.5 space-y-1.5">
                    {post.attachments.map((attachment) => (
                      <AttachmentChip
                        key={attachment.id}
                        attachment={attachment}
                        onOpen={() => openAttachment(post.id, attachment)}
                      />
                    ))}
                  </div>
                ) : null}

                <div className="mt-1.5 -ml-1.5 flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => toggleHeart(post.id)}
                    className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] transition-colors ${
                      post.hearted
                        ? "text-destructive"
                        : "text-muted-foreground opacity-0 group-hover/post:opacity-100 focus-visible:opacity-100 hover:text-foreground"
                    }`}
                  >
                    <Heart size={13} weight={post.hearted ? "fill" : "regular"} />
                    {(post.reactions || 0) + (post.hearted ? 1 : 0) || ""}
                  </button>
                  <button
                    type="button"
                    onClick={() => startReply(post)}
                    className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground opacity-0 transition-colors group-hover/post:opacity-100 focus-visible:opacity-100 hover:text-foreground"
                  >
                    Reply
                  </button>
                  {/* Reacting shouldn't need a drag — the tray opens in place */}
                  {emojiFor === post.id ? (
                    <span className="ml-0.5 flex items-center gap-0.5">
                      {["👍", "❤️", "🔥", "👀", "✅"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            reactToPost(post.id, emoji);
                            setEmojiFor(null);
                          }}
                          className="grid h-6 w-6 place-items-center rounded-full text-[13px] transition-transform hover:scale-125 active:scale-95"
                        >
                          {emoji}
                        </button>
                      ))}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEmojiFor(post.id)}
                      aria-label="Add reaction"
                      className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground opacity-0 transition-colors group-hover/post:opacity-100 focus-visible:opacity-100 hover:text-foreground"
                    >
                      React
                    </button>
                  )}
                  {post.reaction ? (
                    <button
                      type="button"
                      onClick={() => reactToPost(post.id, post.reaction)}
                      title="Remove reaction"
                      className="ml-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[12px] transition-transform hover:scale-105 active:scale-95"
                    >
                      {post.reaction}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
            </div>
            </SwipeActions>
            )}
            </Fragment>
            );
          })}
        </div>
      </div>

      {/* Undo lives for four seconds, then the dismissal is final */}
      {undo ? (
        <div className="slide-up-in pointer-events-none absolute inset-x-0 bottom-[86px] z-30 flex justify-center px-6">
          <div className="pointer-events-auto flex items-center gap-3 overflow-hidden rounded-full bg-foreground py-2 pr-2 pl-4 shadow-[var(--shadow-pop)]">
            <span className="max-w-[280px] truncate text-[12px] text-background">
              Dismissed “{undo.title}”
            </span>
            <button
              type="button"
              onClick={restoreCall}
              className="rounded-full bg-background/15 px-3 py-1 text-[12px] font-semibold text-background transition-colors hover:bg-background/25"
            >
              Undo
            </button>
          </div>
        </div>
      ) : null}

      {/* Composer — a write surface that opens, not a box that is always there */}
      <div
        style={{
          paddingLeft: gapStyle,
          paddingRight: gapStyle,
          paddingBottom: gapStyle,
          paddingTop: "12px",
        }}
        className="shrink-0 border-t border-border/60 bg-surface/70"
      >
        <div className="relative w-full">
          {/* Recipient picker, opened where the pointer already is */}
          {picking ? (
            <>
              <button
                type="button"
                aria-label="Close picker"
                onClick={() => setPicking(false)}
                className="fixed inset-0 z-20 cursor-default"
              />
              <div
                style={{ borderRadius: radiusStyle }}
                className="slide-up-in absolute inset-x-0 bottom-full z-30 mb-2 overflow-hidden border border-border bg-surface shadow-[var(--shadow-pop)]"
              >
                <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
                  <MagnifyingGlass size={14} className="shrink-0 text-muted-foreground" />
                  <input
                    autoFocus
                    value={pickerQuery}
                    onChange={(e) => {
                      setPickerQuery(e.target.value);
                      setPickerIndex(0);
                    }}
                    onKeyDown={onPickerKey}
                    placeholder="Type a name — ↑↓ to move, ↵ to pick"
                    className="min-w-0 flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                  <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[9.5px] text-muted-foreground">
                    esc
                  </kbd>
                </div>

                <ul className="max-h-[260px] overflow-y-auto p-1.5">
                  {pickerList.map((person, i) => (
                    <Fragment key={person.id}>
                      {i > 0 && !person.team && pickerList[i - 1].team ? (
                        <li className="my-1 h-px bg-border" />
                      ) : null}
                      <li>
                        <button
                          type="button"
                          onMouseEnter={() => setPickerIndex(i)}
                          onClick={() => chooseRecipient(person)}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left ${
                            i === pickerIndex ? "bg-brand/10" : ""
                          }`}
                        >
                          <span
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${
                              person.team
                                ? "bg-foreground text-background"
                                : "bg-surface-muted text-foreground"
                            }`}
                          >
                            {initials(person.name)}
                          </span>
                          <span className="min-w-0 truncate text-[12px] text-foreground">
                            {person.name}
                          </span>
                          <span
                            className={`ml-auto shrink-0 text-[10px] ${
                              person.team ? "font-medium text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {person.team ?? person.city}
                          </span>
                        </button>
                      </li>
                    </Fragment>
                  ))}
                  {pickerList.length === 0 ? (
                    <li className="px-2 py-3 text-[12px] text-muted-foreground">
                      No one matches “{pickerQuery}”.
                    </li>
                  ) : null}
                </ul>
              </div>
            </>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {composing ? (
            <div
              style={{ borderRadius: radiusStyle }}
              className="slide-up-in border border-border bg-surface p-3 shadow-[var(--shadow-lift)] transition-[border-color,box-shadow] duration-140 ease-[var(--ease-out)] focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-ring"
            >
              {/* Always name the recipient — a message has to go somewhere */}
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-surface-muted px-2.5 py-1.5">
                {replyTo ? (
                  <ArrowBendUpLeft size={13} className="shrink-0 text-muted-foreground" />
                ) : (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-foreground text-[8px] font-semibold text-background">
                    {initials(sendingTo)}
                  </span>
                )}
                <span className="min-w-0 truncate text-[11.5px] text-muted-foreground">
                  {replyTo ? "Replying to " : "To "}
                  <span className="font-medium text-foreground">
                    {replyTo ? replyTo.author : sendingTo}
                  </span>
                  {!replyTo && recipient?.city ? (
                    <span className="text-muted-foreground"> · {recipient.city}</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={() => (replyTo ? setReplyTo(null) : setPicking(true))}
                  className="ml-auto shrink-0 text-[10.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {replyTo ? "Cancel reply" : "Change"}
                </button>
              </div>
              <textarea
                autoFocus
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") publish();
                  if (e.key === "Escape" && !body.trim() && !staged.length) discardDraft();
                }}
                placeholder={
                  replyTo
                    ? `Reply to ${replyTo.author.split(" ")[0]}…`
                    : `Message ${sendingTo.split(" ")[0]}…`
                }
                rows={3}
                className="w-full resize-none bg-transparent px-1 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />

              {staged.length ? (
                <div className="mt-2 space-y-1.5">
                  {staged.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-muted px-3 py-2"
                    >
                      {attachment.kind === "pdf" ? (
                        <FilePdf size={16} weight="duotone" className="shrink-0 text-foreground" />
                      ) : (
                        <ImageSquare size={16} weight="duotone" className="shrink-0 text-foreground" />
                      )}
                      <span className="min-w-0 truncate text-[11.5px] text-foreground">
                        {attachment.name}
                      </span>
                      <span className="shrink-0 text-[10.5px] text-muted-foreground">
                        {formatBytes(attachment.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => unstage(attachment.id)}
                        aria-label={`Remove ${attachment.name}`}
                        className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {notice ? (
                <p className="mt-2 flex items-center gap-1.5 px-1 text-[11px] text-destructive">
                  <WarningCircle size={13} weight="fill" />
                  {notice}
                </p>
              ) : null}

              <div className="mt-2.5 flex items-center gap-2 border-t border-border/60 pt-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  <Paperclip size={15} />
                  Attach
                </button>
                <span className="text-[10.5px] text-muted-foreground/70">
                  Images &amp; PDF · view once
                </span>

                <button
                  type="button"
                  onClick={discardDraft}
                  className="ml-auto rounded-lg px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={publish}
                  disabled={!canPost}
                  title="⌘⏎"
                  className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-[12px] font-semibold text-brand-foreground transition-[background-color,opacity,transform] duration-140 ease-[var(--ease-out)] hover:bg-brand-hover active:scale-95 disabled:opacity-35"
                >
                  <PaperPlaneTilt size={14} weight="fill" />
                  Post
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openPicker}
              style={{ borderRadius: radiusStyle }}
              className={`flex w-full items-center justify-center gap-2 border border-dashed py-2.5 text-[12.5px] transition-colors ${
                picking
                  ? "border-brand text-brand"
                  : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
              }`}
            >
              <PencilSimple size={15} />
              New message
            </button>
          )}
        </div>
      </div>
      </div>

      {/* Context rail — the full roster (304px width matching notification panel) */}
      <aside className="hidden w-[304px] shrink-0 flex-col overflow-hidden border-l border-border/60 bg-surface-muted/25 xl:flex">
        {/* People — pick anyone here to start a message */}
        <div
          className={`flex min-h-0 flex-1 flex-col px-5 pt-5 ${
            picking ? "rounded-l-2xl ring-2 ring-brand/40 ring-inset" : ""
          }`}
        >
          <div className="flex shrink-0 items-baseline gap-2">
            <p
              className={`text-[10.5px] font-semibold tracking-wide uppercase ${
                picking ? "text-brand" : "text-muted-foreground"
              }`}
            >
              {picking ? "Pick someone" : "People"}
            </p>
            <span className="text-[10.5px] text-muted-foreground/70">
              {people.length} of {directory.length}
            </span>
            {picking ? (
              <button
                type="button"
                onClick={() => setPicking(false)}
                className="ml-auto text-[10.5px] text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <div className="mt-2 flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 focus-within:border-brand/60">
            <MagnifyingGlass size={13} className="shrink-0 text-muted-foreground" />
            <input
              value={peopleQuery}
              onChange={(e) => setPeopleQuery(e.target.value)}
              placeholder="Search name or city"
              className="min-w-0 flex-1 bg-transparent text-[11.5px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            {peopleQuery ? (
              <button
                type="button"
                onClick={() => setPeopleQuery("")}
                aria-label="Clear search"
                className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <X size={10} weight="bold" />
              </button>
            ) : null}
          </div>

          <ul className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto pb-2">
            {[...myTeam, ...everyoneElse].map((person, i) => (
              <Fragment key={person.id}>
                {/* The people who represent you sit above the line */}
                {i === myTeam.length && myTeam.length && everyoneElse.length ? (
                  <li className="flex items-center gap-2 px-1.5 pt-2.5 pb-1">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-[9.5px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
                      Everyone else
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </li>
                ) : null}
                <li>
                  <button
                    type="button"
                    onClick={() => chooseRecipient(person)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors ${
                      recipient?.name === person.name
                        ? "bg-brand/10"
                        : "hover:bg-surface"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${
                        person.team
                          ? "bg-foreground text-background"
                          : "bg-surface-muted text-foreground"
                      }`}
                    >
                      {initials(person.name)}
                    </span>
                    <span className="min-w-0 truncate text-[11.5px] text-foreground">
                      {person.name}
                    </span>
                    <span
                      className={`ml-auto shrink-0 text-[10px] ${
                        person.team ? "font-medium text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {person.team ?? person.city}
                    </span>
                  </button>
                </li>
              </Fragment>
            ))}
            {people.length === 0 ? (
              <li className="px-1.5 py-3 text-[11.5px] text-muted-foreground">
                No one matches “{peopleQuery}”.
              </li>
            ) : null}
          </ul>
        </div>
      </aside>

      {dragging ? (
        <div className="pointer-events-none absolute inset-3 z-40 grid place-items-center rounded-2xl border-2 border-dashed border-brand bg-background/80">
          <p className="text-[13px] font-medium text-brand">
            Drop images or PDFs to attach
          </p>
        </div>
      ) : null}

      <Viewer viewing={viewing} onClose={closeViewer} />
    </div>
  );
}
