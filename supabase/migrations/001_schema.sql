-- ============================================================================
-- 001_schema.sql — Candor Management dashboard: core schema
-- Target: Supabase (Postgres 17)
--
-- Deviations from specs2/02_DATABASE.md (deliberate):
--   * No `users` table with password fields — authentication is handled by
--     Supabase Auth (auth.users). We keep a `public.profiles` table instead.
--   * IMPORTANT (auth linkage tradeoff): profiles.id is a plain uuid PK and
--     does NOT declare a foreign key to auth.users(id). In hosted Supabase we
--     cannot insert rows into auth.users from plain SQL migrations, so a hard
--     FK would make seeding (003_seed.sql) impossible. Instead, the
--     `on_auth_user_created` trigger below inserts/aligns a profiles row with
--     the same id as the auth.users row on every signup, keeping ids in sync
--     for real users. The tradeoff: the database will not cascade-delete a
--     profile when an auth user is deleted, and orphan profile rows (like the
--     seed rows) are possible by design. Application code must treat
--     profiles.id == auth.uid() as the join key.
--   * `talent_portfolio_status` is folded into `talent_profiles`
--     (comp_card_status, digitals_status, last_test_shoot,
--     next_scheduled_shoot, portfolio_notes). Image count is derivable from
--     talent_portfolio_images, so it is not stored.
--   * `casting_analytics` table is SKIPPED — replaced by the
--     `casting_analytics_view` view at the bottom of this file, computed live
--     from casting_interests.
--   * `notifications.requires_response` boolean added so the escalation job
--     (004_functions.sql) doesn't need to hardcode the type list.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
-- gen_random_uuid() is built into Postgres 13+ (pgcrypto no longer required),
-- but we keep pgcrypto for parity with Supabase defaults.
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Enum types
-- (CREATE TYPE has no IF NOT EXISTS, so each is wrapped in a DO block that
--  swallows duplicate_object — makes the migration safely re-runnable.)
-- ----------------------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('talent', 'booker', 'md', 'ceo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.talent_category as enum (
    'model', 'photographer', 'creative_director', 'visual_artist', 'artisan',
    'graphic_designer', 'content_creator', 'influencer', 'brand_partner', 'educator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.talent_status as enum ('active', 'inactive', 'suspended', 'exited');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.exclusivity_type as enum ('exclusive', 'non_exclusive');
exception when duplicate_object then null; end $$;

-- Talent home locations vs booking/casting locations differ slightly in the
-- spec ('usa' vs 'usa_other'), so two enums.
do $$ begin
  create type public.talent_location as enum ('lagos', 'london', 'usa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_location as enum ('lagos', 'london', 'usa_other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.contract_type as enum ('welcome_agreement', 'full_management');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.portfolio_asset_status as enum ('current', 'needs_update', 'missing');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.portfolio_image_type as enum (
    'polaroid', 'comp_card', 'digital', 'editorial', 'commercial', 'test_shoot');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.client_type as enum ('new', 'established');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum (
    'casting_sent', 'pending', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.currency_code as enum ('NGN', 'GBP', 'USD');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum (
    'awaiting_client_payment', 'client_paid', 'talent_paid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_type as enum (
    'availability_check', 'booking_update', 'portfolio_request',
    'payment_update', 'general', 'pre_job_brief', 'announcement');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.response_status as enum (
    'pending', 'accepted', 'declined', 'confirmed', 'queried', 'no_response');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_type as enum (
    'management_agreement', 'welcome_agreement', 'nda', 'code_of_conduct',
    'social_media_policy', 'data_privacy_policy', 'booking_confirmation',
    'call_sheet', 'payment_statement', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.casting_status as enum ('open', 'closed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.casting_response as enum ('interested', 'not_available');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.milestone_visibility as enum ('named', 'anonymous');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- updated_at housekeeping trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- USERS & PROFILES
-- ============================================================================

-- One row per login-capable person (talent AND admin staff). Mirrors
-- auth.users via the on_auth_user_created trigger below — see the file header
-- for why there is intentionally NO FK to auth.users.
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text not null unique,
  role        public.user_role not null default 'talent',
  is_active   boolean not null default true,  -- false disables login without deleting
  last_login  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-provision a profile whenever Supabase Auth creates a user.
-- role/full_name are read from raw_user_meta_data set at invite/signup time
-- (admin-created accounts should pass {"full_name": "...", "role": "talent"}).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'talent')
  )
  on conflict (id) do update
    set email = excluded.email;  -- keep email aligned if profile pre-existed
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- TALENT
-- ============================================================================

-- One row per represented talent. user_id is nullable: profiles are created
-- during onboarding, sometimes before the talent has a login.
-- Portfolio-status fields (folded from the spec's talent_portfolio_status
-- table) live at the bottom of the column list.
create table if not exists public.talent_profiles (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid unique references public.profiles (id) on delete set null,
  first_name            varchar(100) not null,
  last_name             varchar(100) not null,
  category              public.talent_category not null,
  status                public.talent_status not null default 'active',
  exclusivity           public.exclusivity_type not null default 'non_exclusive',
  primary_location      public.talent_location not null,
  secondary_location    public.talent_location,
  instagram_handle      varchar(100),
  phone                 varchar(50),          -- internal use only
  date_of_birth         date,
  bio                   text,
  polaroid_url          varchar(500),         -- fallback profile picture
  contract_start_date   date,
  contract_end_date     date,
  contract_type         public.contract_type not null default 'full_management',
  commission_rate       numeric(5,2) not null default 20.00,
  is_public             boolean not null default true,  -- shown on marketing-site roster
  -- folded from talent_portfolio_status --------------------------------------
  comp_card_status      public.portfolio_asset_status not null default 'missing',
  digitals_status       public.portfolio_asset_status not null default 'missing',
  last_test_shoot       date,
  next_scheduled_shoot  date,
  portfolio_notes       text,
  -- ---------------------------------------------------------------------------
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

drop trigger if exists trg_talent_profiles_updated_at on public.talent_profiles;
create trigger trg_talent_profiles_updated_at
  before update on public.talent_profiles
  for each row execute function public.set_updated_at();

-- Physical measurements (models; nullable for other categories). 1:1 with talent.
create table if not exists public.talent_measurements (
  id              uuid primary key default gen_random_uuid(),
  talent_id       uuid not null unique references public.talent_profiles (id) on delete cascade,
  height_cm       numeric(5,1),
  height_display  varchar(20),   -- e.g. 5'9"
  bust            varchar(10),
  waist           varchar(10),
  hips            varchar(10),
  shoe_uk         varchar(10),
  shoe_eu         varchar(10),
  hair_colour     varchar(50),
  eye_colour      varchar(50),
  dress_size      varchar(20),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_talent_measurements_updated_at on public.talent_measurements;
create trigger trg_talent_measurements_updated_at
  before update on public.talent_measurements
  for each row execute function public.set_updated_at();

-- Portfolio images. Admin-managed; talent view only (enforced in 002_rls.sql).
create table if not exists public.talent_portfolio_images (
  id                   uuid primary key default gen_random_uuid(),
  talent_id            uuid not null references public.talent_profiles (id) on delete cascade,
  image_url            varchar(500) not null,
  image_type           public.portfolio_image_type not null,
  is_primary_polaroid  boolean not null default false,  -- true => used as profile picture
  sort_order           integer not null default 0,
  uploaded_by          uuid references public.profiles (id) on delete set null,
  created_at           timestamptz not null default now()
);

-- ============================================================================
-- CLIENTS
-- ============================================================================

create table if not exists public.clients (
  id              uuid primary key default gen_random_uuid(),
  company_name    varchar(255) not null,
  contact_person  varchar(255),
  email           varchar(255),
  phone           varchar(50),
  address         text,
  client_type     public.client_type not null default 'new',
  -- Derived from client_type ("100% upfront" / "Net 14") but overridable.
  payment_terms   varchar(100),
  notes           text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ============================================================================
-- BOOKINGS
-- ============================================================================

-- Core booking record (maps to the Booking Confirmation document). One talent
-- per booking; multi-talent jobs get one row per talent.
-- RESTRICT on talent/client: bookings are financial history and must not
-- silently vanish when a talent or client row is removed.
create table if not exists public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  talent_id             uuid not null references public.talent_profiles (id) on delete restrict,
  client_id             uuid not null references public.clients (id) on delete restrict,
  project_title         varchar(255) not null,
  service_type          varchar(100),
  status                public.booking_status not null default 'pending',
  booking_date          date not null,
  booking_end_date      date,
  call_time             time,
  location_city         public.booking_location not null,
  location_address      text,
  duration_description  varchar(100),
  talent_fee            numeric(12,2) not null,     -- gross fee
  fee_currency          public.currency_code not null default 'NGN',
  total_client_fee      numeric(12,2),              -- if different from talent fee
  overtime_rate         varchar(100) not null default '1.5x hourly pro-rated',
  media_usage           varchar(255),
  territory             varchar(255),
  usage_term            varchar(100),
  notes                 text,
  pre_job_brief_sent    boolean not null default false,
  call_sheet_sent       boolean not null default false,
  created_by            uuid references public.profiles (id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- Audit trail for booking status changes.
create table if not exists public.booking_status_history (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings (id) on delete cascade,
  old_status  varchar(50),
  new_status  varchar(50) not null,
  changed_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

-- One row per talent payout against a booking. CHECK constraints keep the
-- commission math honest at the database level:
--   commission_amount = gross_fee * commission_rate / 100
--   net_talent_payment = gross_fee - commission_amount
create table if not exists public.payments (
  id                   uuid primary key default gen_random_uuid(),
  booking_id           uuid not null references public.bookings (id) on delete restrict,
  talent_id            uuid not null references public.talent_profiles (id) on delete restrict,
  gross_fee            numeric(12,2) not null,
  commission_rate      numeric(5,2) not null default 20.00,  -- snapshot at payment time
  commission_amount    numeric(12,2) not null,
  net_talent_payment   numeric(12,2) not null,
  currency             public.currency_code not null default 'NGN',
  status               public.payment_status not null default 'awaiting_client_payment',
  client_payment_date  date,
  talent_payment_date  date,
  invoice_number       varchar(50),
  notes                text,
  created_by           uuid references public.profiles (id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint payments_commission_math_chk
    check (commission_amount = round(gross_fee * commission_rate / 100.0, 2)),
  constraint payments_net_math_chk
    check (net_talent_payment = gross_fee - commission_amount)
);

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ============================================================================
-- COMMUNICATIONS (NOTIFICATIONS)
-- ============================================================================

-- All Candor -> talent communications.
-- talent_id NULL means group/broadcast: per-recipient state then lives in
-- notification_recipients.
create table if not exists public.notifications (
  id                 uuid primary key default gen_random_uuid(),
  talent_id          uuid references public.talent_profiles (id) on delete cascade,
  sender_id          uuid references public.profiles (id) on delete set null,
  type               public.notification_type not null,
  title              varchar(255) not null,
  body               text not null,
  booking_id         uuid references public.bookings (id) on delete set null,
  is_read            boolean not null default false,
  -- Whether this notification expects a talent response (drives the action
  -- buttons and the 10-hour escalation job in 004_functions.sql).
  requires_response  boolean not null default false,
  response_status    public.response_status not null default 'pending',
  response_text      text,
  responded_at       timestamptz,
  escalated          boolean not null default false,  -- set by escalation job after 10h silence
  escalated_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

drop trigger if exists trg_notifications_updated_at on public.notifications;
create trigger trg_notifications_updated_at
  before update on public.notifications
  for each row execute function public.set_updated_at();

-- Per-recipient rows for group/broadcast notifications.
create table if not exists public.notification_recipients (
  id               uuid primary key default gen_random_uuid(),
  notification_id  uuid not null references public.notifications (id) on delete cascade,
  talent_id        uuid not null references public.talent_profiles (id) on delete cascade,
  is_read          boolean not null default false,
  response_status  public.response_status not null default 'pending',
  response_text    text,
  responded_at     timestamptz,
  created_at       timestamptz not null default now(),
  constraint notification_recipients_unique unique (notification_id, talent_id)
);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

-- Stored PDFs linked to talent (agreements, deal memos, call sheets, ...).
-- Shared documents (policies etc.) get one row per talent so RLS stays simple.
create table if not exists public.documents (
  id               uuid primary key default gen_random_uuid(),
  talent_id        uuid not null references public.talent_profiles (id) on delete cascade,
  title            varchar(255) not null,
  document_type    public.document_type not null,
  file_url         varchar(500) not null,
  is_personalised  boolean not null default false,
  date_signed      date,
  booking_id       uuid references public.bookings (id) on delete set null,
  uploaded_by      uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now()
);

-- ============================================================================
-- OPEN CASTING BOARD
-- ============================================================================

-- Casting calls. client_id and brand_name_internal are INTERNAL ONLY — talent
-- must never see them. Enforced in 002_rls.sql: talent have no policy on this
-- table at all and instead read the open_castings_public view.
create table if not exists public.open_castings (
  id                   uuid primary key default gen_random_uuid(),
  title                varchar(255) not null,          -- public, no brand name
  description          text,                           -- public, no brand name
  category             public.talent_category not null,
  location             public.booking_location not null,
  shoot_date_start     date not null,
  shoot_date_end       date,
  work_type            varchar(100),
  media_usage          varchar(255),
  requirements         text,
  deadline             timestamptz not null,           -- expressions of interest close
  status               public.casting_status not null default 'open',
  client_id            uuid references public.clients (id) on delete set null,  -- INTERNAL
  brand_name_internal  varchar(255),                                            -- INTERNAL
  created_by           uuid references public.profiles (id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

drop trigger if exists trg_open_castings_updated_at on public.open_castings;
create trigger trg_open_castings_updated_at
  before update on public.open_castings
  for each row execute function public.set_updated_at();

-- Talent expressions of interest. One row per talent per casting.
create table if not exists public.casting_interests (
  id                uuid primary key default gen_random_uuid(),
  casting_id        uuid not null references public.open_castings (id) on delete cascade,
  talent_id         uuid not null references public.talent_profiles (id) on delete cascade,
  response          public.casting_response not null,
  calendar_conflict boolean not null default false,  -- auto-detected booking overlap
  conflict_details  varchar(255),
  shortlisted       boolean not null default false,  -- admin-set
  selected          boolean not null default false,  -- admin-set; triggers brand reveal
  created_at        timestamptz not null default now(),
  constraint casting_interests_unique unique (casting_id, talent_id)
);

-- ============================================================================
-- MILESTONES
-- ============================================================================

-- Community celebration posts, created on talent opt-in, published only after
-- admin approval.
create table if not exists public.milestones (
  id              uuid primary key default gen_random_uuid(),
  talent_id       uuid not null references public.talent_profiles (id) on delete cascade,
  booking_id      uuid not null references public.bookings (id) on delete cascade,
  visibility      public.milestone_visibility not null default 'named',
  display_text    varchar(500),
  admin_approved  boolean not null default false,
  approved_by     uuid references public.profiles (id) on delete set null,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ============================================================================
-- AI ASSISTANT
-- ============================================================================

create table if not exists public.ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  talent_id   uuid not null references public.talent_profiles (id) on delete cascade,
  messages    jsonb not null default '[]'::jsonb,  -- [{role, content, timestamp}, ...]
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_ai_conversations_updated_at on public.ai_conversations;
create trigger trg_ai_conversations_updated_at
  before update on public.ai_conversations
  for each row execute function public.set_updated_at();

-- ============================================================================
-- CASTING ANALYTICS (VIEW — replaces the spec's casting_analytics table)
-- ============================================================================

-- Live per-talent casting engagement, computed from casting_interests.
-- No scheduled job needed. Access is tightened to md/ceo in 002_rls.sql
-- (the view is recreated there with a role gate).
create or replace view public.casting_analytics_view as
select
  tp.id                                                          as talent_id,
  tp.first_name,
  tp.last_name,
  tp.category,
  count(ci.id)                                                   as responses_count,
  count(ci.id) filter (where ci.response = 'interested')         as interests_count,
  count(ci.id) filter (where ci.shortlisted)                     as shortlisted_count,
  count(ci.id) filter (where ci.selected)                        as selected_count,
  round(
    100.0 * count(ci.id) filter (where ci.selected)
    / nullif(count(ci.id) filter (where ci.response = 'interested'), 0),
    2)                                                           as selection_rate_pct
from public.talent_profiles tp
left join public.casting_interests ci on ci.talent_id = tp.id
group by tp.id, tp.first_name, tp.last_name, tp.category;

-- ============================================================================
-- INDEXES (spec-recommended + FK helpers)
-- ============================================================================

create index if not exists idx_talent_profiles_user_id          on public.talent_profiles (user_id);
create index if not exists idx_talent_profiles_category         on public.talent_profiles (category);
create index if not exists idx_talent_profiles_primary_location on public.talent_profiles (primary_location);
create index if not exists idx_talent_profiles_status           on public.talent_profiles (status);

create index if not exists idx_talent_portfolio_images_talent_id on public.talent_portfolio_images (talent_id);

create index if not exists idx_bookings_talent_id    on public.bookings (talent_id);
create index if not exists idx_bookings_client_id    on public.bookings (client_id);
create index if not exists idx_bookings_status       on public.bookings (status);
create index if not exists idx_bookings_booking_date on public.bookings (booking_date);

create index if not exists idx_booking_status_history_booking_id on public.booking_status_history (booking_id);

create index if not exists idx_payments_talent_id  on public.payments (talent_id);
create index if not exists idx_payments_booking_id on public.payments (booking_id);
create index if not exists idx_payments_status     on public.payments (status);

create index if not exists idx_notifications_talent_id       on public.notifications (talent_id);
create index if not exists idx_notifications_response_status on public.notifications (response_status);
create index if not exists idx_notifications_escalated       on public.notifications (escalated);

create index if not exists idx_notification_recipients_talent_id on public.notification_recipients (talent_id);

create index if not exists idx_open_castings_status   on public.open_castings (status);
create index if not exists idx_open_castings_deadline on public.open_castings (deadline);

create index if not exists idx_casting_interests_casting_id on public.casting_interests (casting_id);
create index if not exists idx_casting_interests_talent_id  on public.casting_interests (talent_id);

create index if not exists idx_documents_talent_id on public.documents (talent_id);

create index if not exists idx_milestones_is_published on public.milestones (is_published);
create index if not exists idx_milestones_talent_id    on public.milestones (talent_id);

create index if not exists idx_ai_conversations_talent_id on public.ai_conversations (talent_id);
