"use client";

import { useMemo, useState } from "react";
import {
  Megaphone,
  Pin,
  PinOff,
  Plus,
  Sparkles,
  StickyNote,
  Trash2,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { useActions, useCommunity, useTeam } from "@/lib/store";

const KINDS = [
  {
    id: "milestone",
    label: "Milestone",
    icon: Sparkles,
    tone: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  {
    id: "opportunity",
    label: "Opportunity",
    icon: Megaphone,
    tone: "text-sky-700 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  {
    id: "note",
    label: "Note",
    icon: StickyNote,
    tone: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
];

function kindMeta(id) {
  return KINDS.find((k) => k.id === id) || KINDS[2];
}

function fmtDate(at) {
  const d = new Date(at);
  return `${d.getDate()} ${d.toLocaleString("en-GB", {
    month: "short",
  })} · ${d.toLocaleString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export default function AdminCommunityPage() {
  const community = useCommunity();
  const team = useTeam();
  const {
    addCommunityPost,
    updateCommunityPost,
    deleteCommunityPost,
  } = useActions();

  const [editing, setEditing] = useState(null); // post object or { id: "new", ... }

  const sorted = useMemo(
    () =>
      [...community].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.at) - new Date(a.at);
      }),
    [community]
  );

  const counts = useMemo(() => {
    const c = { total: community.length, pinned: 0 };
    community.forEach((p) => {
      c[p.kind] = (c[p.kind] || 0) + 1;
      if (p.pinned) c.pinned += 1;
    });
    return c;
  }, [community]);

  function startNew() {
    setEditing({
      id: "new",
      kind: "note",
      title: "",
      body: "",
      author: team[0]?.short || "Admin",
      pinned: false,
    });
  }

  function save(draft) {
    if (draft.id === "new") {
      const id = `c-${Date.now().toString(36)}`;
      addCommunityPost({
        ...draft,
        id,
        at: new Date().toISOString(),
      });
    } else {
      updateCommunityPost(draft.id, {
        kind: draft.kind,
        title: draft.title,
        body: draft.body,
        author: draft.author,
        pinned: draft.pinned,
      });
    }
    setEditing(null);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Operations · Community feed
        </div>
        <div className="text-[11px] text-muted-foreground">
          Posts here appear on every talent&apos;s dashboard
        </div>
      </div>
      <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        The <span className="editorial-italic">wire</span>
      </h1>
      <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted-foreground">
        Milestones, opportunities and housekeeping. Pin one. Keep it honest.
        Edits go out immediately to the roster.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        <Stat label="On the wire" value={counts.total} sub="All posts" />
        <Stat
          label="Milestones"
          value={counts.milestone || 0}
          sub="Wins to celebrate"
          accent="emerald"
        />
        <Stat
          label="Opportunities"
          value={counts.opportunity || 0}
          sub="Open to roster"
          accent="sky"
        />
        <Stat
          label="Pinned"
          value={counts.pinned}
          sub="Top of everyone&rsquo;s feed"
        />
      </div>

      <div className="mt-10 flex items-baseline justify-between border-b border-border/60 pb-3">
        <h2 className="font-serif text-[22px] font-light text-foreground">
          <span className="editorial-italic">Posts</span>
        </h2>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[11.5px] font-medium uppercase tracking-[0.14em] text-background transition-all hover:-translate-y-[1px]"
        >
          <Plus className="h-3.5 w-3.5" />
          New post
        </button>
      </div>

      <ul className="divide-y divide-border/60 border-b border-border/60">
        {sorted.length === 0 && (
          <li className="py-14 text-center text-[13px] italic text-muted-foreground">
            Nothing on the wire — post the first update.
          </li>
        )}
        {sorted.map((p) => {
          const meta = kindMeta(p.kind);
          const Icon = meta.icon;
          return (
            <li key={p.id} className="group relative py-6">
              {p.pinned && (
                <span className="absolute left-0 top-6 h-6 w-[2px] rounded-r bg-foreground" />
              )}
              <div className="grid grid-cols-12 items-start gap-x-6">
                <div className="col-span-2">
                  <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]">
                    <Icon className={`h-3 w-3 ${meta.tone}`} />
                    <span className={meta.tone}>{meta.label}</span>
                  </div>
                  <div className="mt-2 font-mono text-[10.5px] text-muted-foreground/70">
                    {fmtDate(p.at)}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground/60">
                    by {p.author}
                  </div>
                </div>
                <div className="col-span-8 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-serif text-[20px] font-light leading-snug text-foreground">
                      {p.title}
                    </h3>
                    {p.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-foreground">
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() =>
                      updateCommunityPost(p.id, { pinned: !p.pinned })
                    }
                    title={p.pinned ? "Unpin" : "Pin"}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {p.pinned ? (
                      <PinOff className="h-3.5 w-3.5" />
                    ) : (
                      <Pin className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing({ ...p })}
                    title="Edit"
                    className="grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${p.title}"?`)) {
                        deleteCommunityPost(p.id);
                      }
                    }}
                    title="Delete"
                    className="grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-rose-500 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {editing && (
        <EditModal
          draft={editing}
          team={team}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function EditModal({ draft: initial, team, onCancel, onSave }) {
  const [draft, setDraft] = useState(initial);
  const isNew = draft.id === "new";

  function set(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) return;
    onSave(draft);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-background/50 backdrop-blur-[6px]"
      />
      <form
        onSubmit={submit}
        className="slide-up-in relative w-[min(640px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_-20px_oklch(0_0_0/0.3)]"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="px-6 pt-6 pb-4">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
            {isNew ? "New community post" : "Edit post"}
          </div>
          <h3 className="mt-1.5 font-serif text-[24px] font-light leading-[1.2] tracking-[-0.02em] text-foreground">
            {isNew ? (
              <>
                Post to the <span className="editorial-italic">wire</span>
              </>
            ) : (
              <>
                Update the <span className="editorial-italic">wire</span>
              </>
            )}
          </h3>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Milestones are for wins. Opportunities open to the roster. Notes
            are housekeeping. Pin one at a time.
          </p>
        </div>

        <div className="space-y-4 px-6 pb-6">
          <Field label="Kind">
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => {
                const active = draft.kind === k.id;
                const Icon = k.icon;
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => set("kind", k.id)}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[11.5px] font-medium transition-colors ${
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {k.label}
                    {active && <Check className="ml-0.5 h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Title">
            <input
              type="text"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Short, declarative. Like a headline."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-serif text-[17px] text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
              required
              autoFocus
            />
          </Field>

          <Field label="Body">
            <textarea
              value={draft.body}
              onChange={(e) => set("body", e.target.value)}
              rows={4}
              placeholder="One or two sentences. The talent reads this on their morning scroll."
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Posting as">
              <select
                value={draft.author}
                onChange={(e) => set("author", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-foreground focus:outline-none"
              >
                {team.map((m) => (
                  <option key={m.id} value={m.short}>
                    {m.short} · {m.role}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Visibility">
              <button
                type="button"
                onClick={() => set("pinned", !draft.pinned)}
                className={`inline-flex h-10 w-full items-center gap-2 rounded-lg border px-3 text-[12.5px] font-medium transition-colors ${
                  draft.pinned
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                <Pin className="h-3.5 w-3.5" />
                {draft.pinned ? "Pinned to top" : "Pin to top"}
              </button>
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[12.5px] font-medium text-background transition-transform hover:-translate-y-[1px]"
          >
            <Check className="h-3.5 w-3.5" />
            {isNew ? "Post to wire" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Stat({ label, value, sub, accent }) {
  const color =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : accent === "sky"
      ? "text-sky-700 dark:text-sky-400"
      : "text-foreground";
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </div>
      <div
        className={`mt-2 font-serif text-[28px] font-light leading-none tracking-[-0.02em] ${color}`}
      >
        {value}
      </div>
      {sub && (
        <div
          className="mt-1 text-[11px] text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: sub }}
        />
      )}
    </div>
  );
}
