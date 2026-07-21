# Candor Dashboard

Operations platform for **Candor Management Agency** — talent management across
Lagos, London, and the USA. Two interfaces behind one login:

- **`/talent`** — represented talent: bookings, payments (20% commission math),
  communications inbox, documents, calendar, portfolio, casting board,
  community milestones, and the **Ask Candor** AI assistant.
- **`/admin`** — Candor's team (booker / MD / CEO): roster, clients, bookings
  with status history, casting board with internal brand privacy, payment
  processing workflow, milestone approvals, analytics, team management.

A public REST endpoint (`/api/public/roster`) feeds the marketing site at
candor-management.com.

## Stack

Next.js 16 (App Router, JS) · Tailwind v4 · Base UI (shadcn "base-nova") ·
Supabase (Postgres 17, Auth, RLS) · Hugging Face Inference (AI assistant).

Design system: **"Porcelain"** — near-white porcelain surfaces with cool ink
type and one disciplined accent, petrol blue `#00749E`, used only where it
means something (primary actions, links, active states, unread, outgoing
chat). Ink dark mode. Type: Geist (UI) / Geist Mono (money, dates, IDs) /
Newsreader (rare editorial italic). Motion follows design-engineering rules:
exact transition properties, strong ease-out curves, everything ≤240ms,
press feedback on everything pressable, reduced-motion supported.
Communications is a real conversation UI on both sides — talent chat with
action cards, admin split-pane messenger with per-talent threads.

## Setup

1. `npm install`
2. Copy `.env.example` → `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — project API settings
   - `SUPABASE_SERVICE_ROLE_KEY` — required only for creating talent/team accounts from the admin UI
   - `HF_TOKEN` — optional; enables the Ask Candor assistant
   - `NEXT_PUBLIC_SITE_URL` — deployment origin (password-reset emails)
3. Apply the database: run `supabase/migrations/*.sql` in order (see
   `supabase/README.md`). `003_seed.sql` is demo data — skip in production.
4. Create your first login: Supabase Dashboard → Authentication → Add user,
   with user metadata `{"full_name": "Your Name", "role": "ceo"}` — the
   signup trigger creates the matching profile. Roles: `talent`, `booker`,
   `md`, `ceo`.
5. `npm run dev`

## Architecture

- `proxy.js` — session refresh + route gating (Next 16's middleware successor)
- `lib/auth.js` — request-cached DAL: `getProfile()`, `requireRole()`, `assertRole()`
- `lib/queries/*` — server-only reads; RLS scopes talent to their own rows
- `lib/actions/*` — zod-validated server actions; every action re-asserts role
- `lib/format.js` — shared money/date/status formatting
- `supabase/migrations/` — schema, RLS policies, seed, escalation function
- `.claude/DATA_LAYER.md` — full contract of the data layer
- `specs2/` — original product specification

Security model: Row-Level Security is the source of truth — talent cannot read
other talents' bookings/payments even if application code is buggy; casting
brand names are physically unselectable by talent (view-based projection);
payment processing is database-gated to MD/CEO.
