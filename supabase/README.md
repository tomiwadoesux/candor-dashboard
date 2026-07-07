# Supabase database — Candor dashboard

PostgreSQL migrations for the Candor Management dashboard (Supabase, Postgres 17).
Schema follows `specs2/02_DATABASE.md` with the deviations noted below.

## Apply order

Run the migrations in filename order (the Supabase CLI does this automatically
with `supabase db push` / `supabase migration up`):

| File | Contents |
|------|----------|
| `migrations/001_schema.sql` | Enums, all tables, `updated_at` triggers, auth signup trigger, `casting_analytics_view`, indexes |
| `migrations/002_rls.sql` | RLS enabled everywhere, role helper functions, all policies, `open_castings_public` and `public_roster` views |
| `migrations/003_seed.sql` | Demo data with fixed UUIDs (re-runnable; every insert is `ON CONFLICT DO NOTHING`) |
| `migrations/004_functions.sql` | `escalate_stale_notifications()` + pg_cron scheduling instructions |

`003_seed.sql` is for dev/demo projects only — skip it in production.

## Auth model and the profiles caveat (important)

- Authentication is **Supabase Auth** (`auth.users`); there is no spec-style
  `users` table with password columns.
- `public.profiles` mirrors auth users (id, full_name, email, role enum
  `talent|booker|md|ceo`, is_active). **`profiles.id` deliberately has no FK
  to `auth.users`**: hosted Supabase does not allow inserting into
  `auth.users` from SQL migrations, and a hard FK would make the seed file
  impossible. Instead, the `on_auth_user_created` trigger inserts a profiles
  row with the same id on every signup (reading `full_name`/`role` from
  `raw_user_meta_data`), keeping ids aligned for real users.
- Consequences: seeded people **cannot log in** (no auth.users rows exist for
  them), and deleting an auth user does not cascade to its profile. To make a
  seed person loginable, create the auth user (dashboard or Admin API) and
  re-point the seed row's id, or just sign up fresh and let the trigger create
  the profile.

## Roles and access (002_rls.sql)

- Helper functions (SECURITY DEFINER): `current_user_role()` (the spec's
  `current_role()` — renamed because `CURRENT_ROLE` is a reserved SQL
  keyword), `is_admin()`, `is_md_or_ceo()`, `current_talent_id()`.
- **talent**: SELECT own rows only (profile, measurements, portfolio,
  bookings, payments, documents, notifications incl. broadcast via
  `notification_recipients`, ai_conversations); INSERT/UPDATE own
  `casting_interests` (cannot touch `shortlisted`/`selected`); INSERT own
  milestones; SELECT published milestones.
- **Castings privacy**: talent have *no* policy on `open_castings` — they read
  the `open_castings_public` view (open castings only, without `client_id` /
  `brand_name_internal`).
- **booker/md/ceo**: full SELECT/INSERT/UPDATE on operational tables.
  Payments INSERT/UPDATE, analytics (`casting_analytics_view` returns rows
  only for md/ceo), and profile management are **md/ceo**; DELETE is md/ceo
  generally, CEO-only for talent accounts, booker-allowed for milestone
  rejection and casting-interest removal.
- **anon**: SELECT on `public_roster` only (public, active talent + primary
  polaroid) for the marketing site.

## Other design notes

- `talent_portfolio_status` is folded into `talent_profiles`
  (`comp_card_status`, `digitals_status`, `last_test_shoot`,
  `next_scheduled_shoot`, `portfolio_notes`).
- The `casting_analytics` table is replaced by the live
  `casting_analytics_view` (interests / shortlisted / selected counts and
  selection rate per talent) — no scheduled recalculation job needed.
- `payments` carries CHECK constraints enforcing the commission math:
  `commission_amount = round(gross_fee * commission_rate / 100, 2)` and
  `net_talent_payment = gross_fee - commission_amount`.
- `notifications.requires_response` drives the action buttons and the 10-hour
  escalation sweep. Schedule `escalate_stale_notifications()` hourly with
  pg_cron — see the comment block at the end of `004_functions.sql`.
