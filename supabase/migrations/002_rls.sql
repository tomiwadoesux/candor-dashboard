-- ============================================================================
-- 002_rls.sql — Row Level Security, helper functions, and access views
--
-- Role model (public.profiles.role):
--   talent  — sees/edits ONLY their own rows
--   booker  — operational admin (no payment processing, no analytics, no team mgmt)
--   md/ceo  — full admin; payments processing, analytics, profile management
--
-- Column-privacy rule: talent must NEVER see open_castings.client_id or
-- brand_name_internal. Talent therefore get NO policy on open_castings at all
-- and instead read the open_castings_public VIEW defined below.
--
-- Note: the spec asked for a helper named public.current_role(), but
-- CURRENT_ROLE is a reserved SQL keyword in Postgres, so the helper is named
-- public.current_user_role() instead.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper functions
-- SECURITY DEFINER so they can read profiles/talent_profiles without tripping
-- the very RLS policies that call them (no recursion: definer bypasses RLS).
-- ----------------------------------------------------------------------------

create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- True for any staff role.
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.current_user_role() in ('booker', 'md', 'ceo');
$$;

-- True for senior staff (payment processing, analytics, team management).
create or replace function public.is_md_or_ceo()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.current_user_role() in ('md', 'ceo');
$$;

-- The talent_profiles.id owned by the current auth user (null for admins).
create or replace function public.current_talent_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select id from public.talent_profiles where user_id = auth.uid();
$$;

grant execute on function public.current_user_role() to authenticated, anon;
grant execute on function public.is_admin()          to authenticated, anon;
grant execute on function public.is_md_or_ceo()      to authenticated, anon;
grant execute on function public.current_talent_id() to authenticated, anon;

-- ----------------------------------------------------------------------------
-- Enable RLS on every table
-- ----------------------------------------------------------------------------

alter table public.profiles                enable row level security;
alter table public.talent_profiles         enable row level security;
alter table public.talent_measurements     enable row level security;
alter table public.talent_portfolio_images enable row level security;
alter table public.clients                 enable row level security;
alter table public.bookings                enable row level security;
alter table public.booking_status_history  enable row level security;
alter table public.payments                enable row level security;
alter table public.notifications           enable row level security;
alter table public.notification_recipients enable row level security;
alter table public.documents               enable row level security;
alter table public.open_castings           enable row level security;
alter table public.casting_interests       enable row level security;
alter table public.milestones              enable row level security;
alter table public.ai_conversations        enable row level security;

-- ============================================================================
-- PROFILES
-- Talent: read own row. Admins: read all. Managing accounts (insert/update)
-- is md/ceo; deleting accounts is ceo only (per the admin permission matrix).
-- ============================================================================

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
  for select using (public.is_admin());

drop policy if exists profiles_insert_md_ceo on public.profiles;
create policy profiles_insert_md_ceo on public.profiles
  for insert with check (public.is_md_or_ceo());

drop policy if exists profiles_update_md_ceo on public.profiles;
create policy profiles_update_md_ceo on public.profiles
  for update using (public.is_md_or_ceo());

drop policy if exists profiles_delete_ceo on public.profiles;
create policy profiles_delete_ceo on public.profiles
  for delete using (public.current_user_role() = 'ceo');

-- ============================================================================
-- TALENT_PROFILES
-- ============================================================================

drop policy if exists talent_profiles_select_own on public.talent_profiles;
create policy talent_profiles_select_own on public.talent_profiles
  for select using (user_id = auth.uid());

drop policy if exists talent_profiles_select_admin on public.talent_profiles;
create policy talent_profiles_select_admin on public.talent_profiles
  for select using (public.is_admin());

drop policy if exists talent_profiles_insert_admin on public.talent_profiles;
create policy talent_profiles_insert_admin on public.talent_profiles
  for insert with check (public.is_admin());

drop policy if exists talent_profiles_update_admin on public.talent_profiles;
create policy talent_profiles_update_admin on public.talent_profiles
  for update using (public.is_admin());

-- "Delete talent accounts" is CEO-only in the permission matrix.
drop policy if exists talent_profiles_delete_ceo on public.talent_profiles;
create policy talent_profiles_delete_ceo on public.talent_profiles
  for delete using (public.current_user_role() = 'ceo');

-- ============================================================================
-- TALENT_MEASUREMENTS — talent read own; admins manage.
-- ============================================================================

drop policy if exists talent_measurements_select_own on public.talent_measurements;
create policy talent_measurements_select_own on public.talent_measurements
  for select using (talent_id = public.current_talent_id());

drop policy if exists talent_measurements_all_admin on public.talent_measurements;
create policy talent_measurements_all_admin on public.talent_measurements
  for select using (public.is_admin());

drop policy if exists talent_measurements_insert_admin on public.talent_measurements;
create policy talent_measurements_insert_admin on public.talent_measurements
  for insert with check (public.is_admin());

drop policy if exists talent_measurements_update_admin on public.talent_measurements;
create policy talent_measurements_update_admin on public.talent_measurements
  for update using (public.is_admin());

drop policy if exists talent_measurements_delete_md_ceo on public.talent_measurements;
create policy talent_measurements_delete_md_ceo on public.talent_measurements
  for delete using (public.is_md_or_ceo());

-- ============================================================================
-- TALENT_PORTFOLIO_IMAGES — talent view only; admin-managed uploads.
-- ============================================================================

drop policy if exists portfolio_images_select_own on public.talent_portfolio_images;
create policy portfolio_images_select_own on public.talent_portfolio_images
  for select using (talent_id = public.current_talent_id());

drop policy if exists portfolio_images_select_admin on public.talent_portfolio_images;
create policy portfolio_images_select_admin on public.talent_portfolio_images
  for select using (public.is_admin());

drop policy if exists portfolio_images_insert_admin on public.talent_portfolio_images;
create policy portfolio_images_insert_admin on public.talent_portfolio_images
  for insert with check (public.is_admin());

drop policy if exists portfolio_images_update_admin on public.talent_portfolio_images;
create policy portfolio_images_update_admin on public.talent_portfolio_images
  for update using (public.is_admin());

drop policy if exists portfolio_images_delete_admin on public.talent_portfolio_images;
create policy portfolio_images_delete_admin on public.talent_portfolio_images
  for delete using (public.is_admin());  -- deleting/reordering images is routine booker work

-- ============================================================================
-- CLIENTS — admin only; talent never see clients (brand privacy).
-- ============================================================================

drop policy if exists clients_select_admin on public.clients;
create policy clients_select_admin on public.clients
  for select using (public.is_admin());

drop policy if exists clients_insert_admin on public.clients;
create policy clients_insert_admin on public.clients
  for insert with check (public.is_admin());

drop policy if exists clients_update_admin on public.clients;
create policy clients_update_admin on public.clients
  for update using (public.is_admin());

drop policy if exists clients_delete_md_ceo on public.clients;
create policy clients_delete_md_ceo on public.clients
  for delete using (public.is_md_or_ceo());

-- ============================================================================
-- BOOKINGS — talent read own; admins manage.
-- ============================================================================

drop policy if exists bookings_select_own on public.bookings;
create policy bookings_select_own on public.bookings
  for select using (talent_id = public.current_talent_id());

drop policy if exists bookings_select_admin on public.bookings;
create policy bookings_select_admin on public.bookings
  for select using (public.is_admin());

drop policy if exists bookings_insert_admin on public.bookings;
create policy bookings_insert_admin on public.bookings
  for insert with check (public.is_admin());

drop policy if exists bookings_update_admin on public.bookings;
create policy bookings_update_admin on public.bookings
  for update using (public.is_admin());

drop policy if exists bookings_delete_md_ceo on public.bookings;
create policy bookings_delete_md_ceo on public.bookings
  for delete using (public.is_md_or_ceo());

-- ============================================================================
-- BOOKING_STATUS_HISTORY — admin audit trail (no talent access).
-- ============================================================================

drop policy if exists booking_history_select_admin on public.booking_status_history;
create policy booking_history_select_admin on public.booking_status_history
  for select using (public.is_admin());

drop policy if exists booking_history_insert_admin on public.booking_status_history;
create policy booking_history_insert_admin on public.booking_status_history
  for insert with check (public.is_admin());

drop policy if exists booking_history_delete_md_ceo on public.booking_status_history;
create policy booking_history_delete_md_ceo on public.booking_status_history
  for delete using (public.is_md_or_ceo());

-- ============================================================================
-- PAYMENTS — talent read own; all admins read; only md/ceo create/process
-- (per permission matrix: "Create/process payments — Booker: No").
-- ============================================================================

drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments
  for select using (talent_id = public.current_talent_id());

drop policy if exists payments_select_admin on public.payments;
create policy payments_select_admin on public.payments
  for select using (public.is_admin());

drop policy if exists payments_insert_md_ceo on public.payments;
create policy payments_insert_md_ceo on public.payments
  for insert with check (public.is_md_or_ceo());

drop policy if exists payments_update_md_ceo on public.payments;
create policy payments_update_md_ceo on public.payments
  for update using (public.is_md_or_ceo());

drop policy if exists payments_delete_md_ceo on public.payments;
create policy payments_delete_md_ceo on public.payments
  for delete using (public.is_md_or_ceo());

-- ============================================================================
-- NOTIFICATIONS — talent read direct + broadcast (via recipients); talent may
-- UPDATE their own direct notifications to record read/response state.
-- (Row-level only: Postgres policies cannot limit which columns an UPDATE
-- touches, so the API layer must only expose is_read/response_* mutations.)
-- ============================================================================

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (
    talent_id = public.current_talent_id()
    or exists (
      select 1 from public.notification_recipients nr
      where nr.notification_id = notifications.id
        and nr.talent_id = public.current_talent_id()
    )
  );

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update
  using (talent_id = public.current_talent_id())
  with check (talent_id = public.current_talent_id());

drop policy if exists notifications_select_admin on public.notifications;
create policy notifications_select_admin on public.notifications
  for select using (public.is_admin());

drop policy if exists notifications_insert_admin on public.notifications;
create policy notifications_insert_admin on public.notifications
  for insert with check (public.is_admin());

drop policy if exists notifications_update_admin on public.notifications;
create policy notifications_update_admin on public.notifications
  for update using (public.is_admin());

drop policy if exists notifications_delete_md_ceo on public.notifications;
create policy notifications_delete_md_ceo on public.notifications
  for delete using (public.is_md_or_ceo());

-- ---- notification_recipients (per-recipient broadcast state) ---------------

drop policy if exists notification_recipients_select_own on public.notification_recipients;
create policy notification_recipients_select_own on public.notification_recipients
  for select using (talent_id = public.current_talent_id());

drop policy if exists notification_recipients_update_own on public.notification_recipients;
create policy notification_recipients_update_own on public.notification_recipients
  for update
  using (talent_id = public.current_talent_id())
  with check (talent_id = public.current_talent_id());

drop policy if exists notification_recipients_select_admin on public.notification_recipients;
create policy notification_recipients_select_admin on public.notification_recipients
  for select using (public.is_admin());

drop policy if exists notification_recipients_insert_admin on public.notification_recipients;
create policy notification_recipients_insert_admin on public.notification_recipients
  for insert with check (public.is_admin());

drop policy if exists notification_recipients_update_admin on public.notification_recipients;
create policy notification_recipients_update_admin on public.notification_recipients
  for update using (public.is_admin());

drop policy if exists notification_recipients_delete_md_ceo on public.notification_recipients;
create policy notification_recipients_delete_md_ceo on public.notification_recipients
  for delete using (public.is_md_or_ceo());

-- ============================================================================
-- DOCUMENTS — talent read own; admins manage.
-- ============================================================================

drop policy if exists documents_select_own on public.documents;
create policy documents_select_own on public.documents
  for select using (talent_id = public.current_talent_id());

drop policy if exists documents_select_admin on public.documents;
create policy documents_select_admin on public.documents
  for select using (public.is_admin());

drop policy if exists documents_insert_admin on public.documents;
create policy documents_insert_admin on public.documents
  for insert with check (public.is_admin());

drop policy if exists documents_update_admin on public.documents;
create policy documents_update_admin on public.documents
  for update using (public.is_admin());

drop policy if exists documents_delete_md_ceo on public.documents;
create policy documents_delete_md_ceo on public.documents
  for delete using (public.is_md_or_ceo());

-- ============================================================================
-- OPEN_CASTINGS — ADMIN ONLY on the base table.
-- Talent intentionally get NO policy here: they must never see client_id or
-- brand_name_internal, and RLS cannot hide columns. Talent read the
-- open_castings_public view below instead.
-- ============================================================================

drop policy if exists open_castings_select_admin on public.open_castings;
create policy open_castings_select_admin on public.open_castings
  for select using (public.is_admin());

drop policy if exists open_castings_insert_admin on public.open_castings;
create policy open_castings_insert_admin on public.open_castings
  for insert with check (public.is_admin());

drop policy if exists open_castings_update_admin on public.open_castings;
create policy open_castings_update_admin on public.open_castings
  for update using (public.is_admin());

drop policy if exists open_castings_delete_md_ceo on public.open_castings;
create policy open_castings_delete_md_ceo on public.open_castings
  for delete using (public.is_md_or_ceo());

-- Talent-facing casting board: only open castings, only public columns.
-- Deliberately a SECURITY DEFINER view (Postgres default): it must bypass the
-- base table's RLS, because talent have no policy on open_castings at all.
-- The view itself is the security boundary — it hard-filters status = 'open'
-- and omits client_id / brand_name_internal.
create or replace view public.open_castings_public as
select
  id, title, description, category, location,
  shoot_date_start, shoot_date_end, work_type, media_usage,
  requirements, deadline, status, created_at, updated_at
from public.open_castings
where status = 'open';

-- Only logged-in users (talent + admins) may read the board; not anon.
revoke all on public.open_castings_public from anon;
grant select on public.open_castings_public to authenticated;

-- ============================================================================
-- CASTING_INTERESTS — talent insert/update/read their OWN interest rows.
-- WITH CHECK forbids talent from writing shortlisted/selected (admin-only
-- flags), and USING freezes a row for the talent once the admin has
-- shortlisted or selected them.
-- ============================================================================

drop policy if exists casting_interests_select_own on public.casting_interests;
create policy casting_interests_select_own on public.casting_interests
  for select using (talent_id = public.current_talent_id());

drop policy if exists casting_interests_insert_own on public.casting_interests;
create policy casting_interests_insert_own on public.casting_interests
  for insert with check (
    talent_id = public.current_talent_id()
    and shortlisted = false
    and selected = false
  );

drop policy if exists casting_interests_update_own on public.casting_interests;
create policy casting_interests_update_own on public.casting_interests
  for update
  using (
    talent_id = public.current_talent_id()
    and shortlisted = false
    and selected = false
  )
  with check (
    talent_id = public.current_talent_id()
    and shortlisted = false
    and selected = false
  );

drop policy if exists casting_interests_select_admin on public.casting_interests;
create policy casting_interests_select_admin on public.casting_interests
  for select using (public.is_admin());

drop policy if exists casting_interests_insert_admin on public.casting_interests;
create policy casting_interests_insert_admin on public.casting_interests
  for insert with check (public.is_admin());

drop policy if exists casting_interests_update_admin on public.casting_interests;
create policy casting_interests_update_admin on public.casting_interests
  for update using (public.is_admin());

drop policy if exists casting_interests_delete_admin on public.casting_interests;
create policy casting_interests_delete_admin on public.casting_interests
  for delete using (public.is_admin());  -- "Remove from consideration" is booker work

-- ============================================================================
-- MILESTONES — talent create their own (unapproved, unpublished) and read
-- published ones plus their own; admins manage the approval queue.
-- Booker may delete here despite the general md/ceo rule: "Reject" in the
-- approval queue is defined as a delete and is booker-permitted work.
-- ============================================================================

drop policy if exists milestones_select_talent on public.milestones;
create policy milestones_select_talent on public.milestones
  for select using (
    is_published = true
    or talent_id = public.current_talent_id()
  );

drop policy if exists milestones_insert_own on public.milestones;
create policy milestones_insert_own on public.milestones
  for insert with check (
    talent_id = public.current_talent_id()
    and admin_approved = false
    and is_published = false
  );

drop policy if exists milestones_select_admin on public.milestones;
create policy milestones_select_admin on public.milestones
  for select using (public.is_admin());

drop policy if exists milestones_insert_admin on public.milestones;
create policy milestones_insert_admin on public.milestones
  for insert with check (public.is_admin());

drop policy if exists milestones_update_admin on public.milestones;
create policy milestones_update_admin on public.milestones
  for update using (public.is_admin());

drop policy if exists milestones_delete_admin on public.milestones;
create policy milestones_delete_admin on public.milestones
  for delete using (public.is_admin());

-- ============================================================================
-- AI_CONVERSATIONS — talent own their chat history end-to-end; admins can
-- read (support/debugging) but not write.
-- ============================================================================

drop policy if exists ai_conversations_select_own on public.ai_conversations;
create policy ai_conversations_select_own on public.ai_conversations
  for select using (talent_id = public.current_talent_id());

drop policy if exists ai_conversations_insert_own on public.ai_conversations;
create policy ai_conversations_insert_own on public.ai_conversations
  for insert with check (talent_id = public.current_talent_id());

drop policy if exists ai_conversations_update_own on public.ai_conversations;
create policy ai_conversations_update_own on public.ai_conversations
  for update
  using (talent_id = public.current_talent_id())
  with check (talent_id = public.current_talent_id());

drop policy if exists ai_conversations_select_admin on public.ai_conversations;
create policy ai_conversations_select_admin on public.ai_conversations
  for select using (public.is_admin());

drop policy if exists ai_conversations_delete_md_ceo on public.ai_conversations;
create policy ai_conversations_delete_md_ceo on public.ai_conversations
  for delete using (public.is_md_or_ceo());

-- ============================================================================
-- CASTING ANALYTICS VIEW — md/ceo only.
-- Views cannot carry RLS policies and Postgres grants are per DB role (all
-- app users share `authenticated`), so the md/ceo restriction is enforced
-- inside the view: other roles simply get zero rows.
-- Recreated from 001 with the identical column list plus the role gate.
-- ============================================================================

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
where public.is_md_or_ceo()
group by tp.id, tp.first_name, tp.last_name, tp.category;

revoke all on public.casting_analytics_view from anon;
grant select on public.casting_analytics_view to authenticated;

-- ============================================================================
-- PUBLIC ROSTER VIEW — anonymous read for the marketing website.
-- SECURITY DEFINER (default) so anon can read despite table RLS; the view is
-- the boundary: only public, active talent, and only marketing-safe columns
-- (no phone, DOB, contract or commission data).
-- ============================================================================

create or replace view public.public_roster as
select
  tp.id,
  tp.first_name,
  tp.last_name,
  tp.category,
  tp.primary_location,
  tp.instagram_handle,
  tp.bio,
  coalesce(img.image_url, tp.polaroid_url) as polaroid_url
from public.talent_profiles tp
left join lateral (
  select i.image_url
  from public.talent_portfolio_images i
  where i.talent_id = tp.id
    and i.is_primary_polaroid
  order by i.created_at desc
  limit 1
) img on true
where tp.is_public
  and tp.status = 'active';

grant select on public.public_roster to anon, authenticated;
