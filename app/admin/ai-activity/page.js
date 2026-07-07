import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listAiConversations } from "@/lib/queries/ai";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageIntro, Stat, Eyebrow } from "@/components/admin/kit";

export const metadata = { title: "AI activity — Candor Admin" };

function timeLabel(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${d
    .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

// Read-only transcript — the talent-side chat interface, minus the composer.
function Transcript({ convo }) {
  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-serif text-[15px] italic leading-tight text-foreground">
            Ask Candor · {convo.talent.first_name} {convo.talent.last_name}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {convo.questionCount} question{convo.questionCount === 1 ? "" : "s"} · last
            activity {relativeTime(convo.updatedAt)} · read-only
          </div>
        </div>
        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Viewing
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {convo.messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {m.role !== "user" && (
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                <Sparkles className="h-3 w-3" />
              </div>
            )}
            <div className="max-w-[78%]">
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-md bg-foreground text-background"
                    : "rounded-bl-md bg-surface-muted text-foreground"
                )}
              >
                {m.content}
              </div>
              {m.timestamp ? (
                <div
                  className={cn(
                    "mt-1 text-[10px] text-muted-foreground/70",
                    m.role === "user" ? "text-right" : "text-left"
                  )}
                >
                  {timeLabel(m.timestamp)}
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {convo.messages.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted-foreground">
            No messages in this conversation yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default async function AiActivityPage({ searchParams }) {
  await requireRole("booker", "md", "ceo");
  const conversations = await listAiConversations();
  const params = await searchParams;

  const selected =
    conversations.find((c) => c.id === params.conversation) ?? conversations[0];
  const totalQuestions = conversations.reduce((n, c) => n + c.questionCount, 0);

  return (
    <div>
      <PageIntro
        eyebrow="Communications · AI activity"
        meta={`${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`}
        title={
          <>
            Ask Candor <span className="editorial-italic">activity</span>
          </>
        }
        lede="Every question talent ask their assistant and the answer it gave, grounded in their own account only. Read-only — you're observing, not replying."
      />

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-3">
        <Stat label="Conversations" value={conversations.length} sub="Talent using the assistant" />
        <Stat label="Questions asked" value={totalQuestions} sub="All time" />
        <Stat
          label="Last activity"
          value={conversations[0] ? relativeTime(conversations[0].updatedAt) : "—"}
          sub={
            conversations[0]
              ? `${conversations[0].talent.first_name} ${conversations[0].talent.last_name}`
              : "No usage yet"
          }
        />
      </div>

      {conversations.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">
          No talent has spoken to Ask Candor yet. Activity will appear here the
          moment someone asks their first question.
        </p>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
          <div>
            <Eyebrow>Talent</Eyebrow>
            <div className="mt-3 space-y-1.5">
              {conversations.map((c) => {
                const active = selected?.id === c.id;
                return (
                  <Link
                    key={c.id}
                    href={`/admin/ai-activity?conversation=${c.id}`}
                    className={cn(
                      "nav-item block rounded-xl border px-3.5 py-3",
                      active
                        ? "border-border-strong bg-card shadow-soft"
                        : "border-transparent hover:border-border hover:bg-card"
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {c.talent.first_name} {c.talent.last_name}
                      </span>
                      <span className="shrink-0 text-[10.5px] text-muted-foreground">
                        {relativeTime(c.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {c.lastRole === "assistant" ? "↳ " : ""}
                      {c.lastMessage ?? "No messages"}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {selected ? <Transcript convo={selected} /> : null}
        </div>
      )}
    </div>
  );
}
