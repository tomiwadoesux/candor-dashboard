import { Sparkles } from "lucide-react";
import { preview } from "@/lib/preview/mock";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageIntro, Stat, Eyebrow } from "@/components/admin/kit";
import { AdminFrame } from "@/components/preview/admin-frame";

function Transcript({ convo }) {
  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-medium leading-tight text-foreground">
            Ask Candor · {convo.talent.first_name} {convo.talent.last_name}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {convo.questionCount} questions · last activity {relativeTime(convo.updated_at)} · read-only
          </div>
        </div>
        <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground">Viewing</span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {convo.messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("bubble", m.role === "user" ? "bubble-out" : "bubble-in")}>{m.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const conversations = preview.aiActivity;
  const selected = conversations[0];
  const totalQuestions = conversations.reduce((n, c) => n + c.questionCount, 0);

  return (
    <AdminFrame>
      <PageIntro
        eyebrow="Communications · AI activity"
        meta={`${conversations.length} conversations`}
        title={<>Ask Candor activity</>}
        lede="Every question talent ask their assistant and the answer it gave, grounded in their own account only. Read-only."
      />
      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border py-5 md:grid-cols-3">
        <Stat label="Conversations" value={conversations.length} sub="Talent using the assistant" />
        <Stat label="Questions asked" value={totalQuestions} sub="All time" />
        <Stat label="Last activity" value={relativeTime(conversations[0].updated_at)} sub={`${conversations[0].talent.first_name} ${conversations[0].talent.last_name}`} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div>
          <Eyebrow>Talent</Eyebrow>
          <div className="mt-3 space-y-1.5">
            {conversations.map((c) => {
              const active = selected?.id === c.id;
              const last = c.messages[c.messages.length - 1];
              return (
                <div key={c.id} className={cn("nav-item block rounded-xl border px-3.5 py-3", active ? "border-border-strong bg-card shadow-[var(--shadow-soft)]" : "border-transparent hover:border-border hover:bg-card")}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[13px] font-medium text-foreground">{c.talent.first_name} {c.talent.last_name}</span>
                    <span className="shrink-0 text-[10.5px] text-muted-foreground">{relativeTime(c.updated_at)}</span>
                  </div>
                  <p className="mt-1 truncate text-[12px] text-muted-foreground">{last?.role === "assistant" ? "↳ " : ""}{last?.content}</p>
                </div>
              );
            })}
          </div>
        </div>
        {selected ? <Transcript convo={selected} /> : null}
      </div>
    </AdminFrame>
  );
}
