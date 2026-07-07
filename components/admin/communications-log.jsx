// Server component — tab filter is searchParams-driven.

import Link from "next/link";
import { AlertTriangle, Megaphone, User } from "lucide-react";
import { relativeTime, statusLabel } from "@/lib/format";
import { EmptyRow, accentText } from "@/components/admin/kit";

const TABS = [
  { id: "all", label: "All" },
  { id: "awaiting", label: "Awaiting response" },
  { id: "escalated", label: "Escalated" },
];

function responseAccent(status) {
  switch (status) {
    case "accepted":
    case "confirmed":
      return "success";
    case "declined":
      return "destructive";
    case "queried":
      return "warning";
    case "pending":
      return "muted";
    default:
      return "muted";
  }
}

function typeAccent(type) {
  switch (type) {
    case "payment_update":
      return "success";
    case "availability_check":
    case "booking_update":
    case "pre_job_brief":
      return "warning";
    case "announcement":
      return "bronze";
    default:
      return "muted";
  }
}

export function CommunicationsLog({ notifications, tab = "all" }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <Link
              key={t.id}
              href={t.id === "all" ? "/admin/communications" : `/admin/communications?tab=${t.id}`}
              className={`pressable inline-flex items-center rounded-full border px-3 py-1 text-[11px] transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {notifications.map((n) => {
          const recipients = n.recipients || [];
          const isBroadcast = !n.talent && recipients.length > 0;
          return (
            <li key={n.id} className="py-5">
              <div className="grid grid-cols-12 items-start gap-x-4">
                <div className="col-span-2">
                  <div
                    className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${accentText(typeAccent(n.type))}`}
                  >
                    {isBroadcast ? (
                      <Megaphone className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    {statusLabel(n.type)}
                  </div>
                  <div className="mt-2 font-mono text-[10.5px] text-muted-foreground/70">
                    {relativeTime(n.created_at)}
                  </div>
                  {n.sender && (
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground/60">
                      by {n.sender.full_name}
                    </div>
                  )}
                  {n.escalated && (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      Escalated
                    </div>
                  )}
                </div>

                <div className="col-span-7 min-w-0">
                  <h3 className="font-serif text-[19px] font-light leading-snug text-foreground">
                    {n.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
                    {n.body}
                  </p>
                </div>

                <div className="col-span-3 text-right">
                  {!isBroadcast ? (
                    <>
                      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                        To
                      </div>
                      <div className="mt-0.5 truncate text-[12.5px] text-foreground">
                        {n.talent
                          ? `${n.talent.first_name} ${n.talent.last_name}`
                          : "—"}
                      </div>
                      {n.requires_response && (
                        <div
                          className={`mt-1 text-[10.5px] uppercase tracking-[0.14em] ${accentText(responseAccent(n.response_status))}`}
                        >
                          {n.response_status === "pending"
                            ? "Awaiting reply"
                            : statusLabel(n.response_status)}
                        </div>
                      )}
                      {n.response_text && (
                        <div className="mt-1 truncate text-[11px] italic text-muted-foreground">
                          “{n.response_text}”
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                        Recipients · {recipients.length}
                      </div>
                      <ul className="mt-1 space-y-0.5">
                        {recipients.slice(0, 4).map((r) => (
                          <li
                            key={r.id}
                            className="flex items-baseline justify-end gap-2 text-[11px]"
                          >
                            <span className="truncate text-muted-foreground">
                              {r.talent
                                ? `${r.talent.first_name} ${r.talent.last_name}`
                                : "—"}
                            </span>
                            <span
                              className={`shrink-0 text-[9.5px] uppercase tracking-[0.12em] ${accentText(responseAccent(r.response_status))}`}
                            >
                              {n.requires_response
                                ? statusLabel(r.response_status)
                                : r.is_read
                                  ? "Read"
                                  : "Unread"}
                            </span>
                          </li>
                        ))}
                        {recipients.length > 4 && (
                          <li className="text-[10px] text-muted-foreground/70">
                            + {recipients.length - 4} more
                          </li>
                        )}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {notifications.length === 0 && (
          <EmptyRow>
            Nothing on the wire in this view — compose the first message above.
          </EmptyRow>
        )}
      </ul>
    </>
  );
}
