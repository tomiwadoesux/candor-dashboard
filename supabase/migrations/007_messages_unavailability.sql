-- ============================================================================
-- 007_messages_unavailability.sql — conversational backend + talent self-service
--
-- 1. messages               — free-form two-way chat between a talent and the
--                             Candor team (structured asks stay in notifications)
-- 2. talent_unavailability  — talent-declared out-dates, feeding the calendar
--                             and the admin availability radar
-- 3. talent_measurements    — talent may now create/refresh their own card
-- ============================================================================

-- ----------------------------------------------------------------------------
-- MESSAGES
-- ----------------------------------------------------------------------------

create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  talent_id        uuid not null references public.talent_profiles (id) on delete cascade,
  sender_id        uuid references public.profiles (id) on delete set null,
  sender_is_talent boolean not null,
  body             text not null check (char_length(body) between 1 and 4000),
  -- read by the receiving side (talent for admin messages, and vice versa)
  is_read          boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists messages_talent_created_idx
  on public.messages (talent_id, created_at);
create index if not exists messages_unread_idx
  on public.messages (talent_id) where not is_read;

alter table public.messages enable row level security;

create policy messages_select_own on public.messages
  for select using (talent_id = public.current_talent_id());

create policy messages_select_admin on public.messages
  for select using (public.is_admin());

create policy messages_insert_talent on public.messages
  for insert with check (
    talent_id = public.current_talent_id()
    and sender_is_talent
    and sender_id = auth.uid()
  );

create policy messages_insert_admin on public.messages
  for insert with check (
    public.is_admin()
    and not sender_is_talent
    and sender_id = auth.uid()
  );

-- Each side may only mark the OTHER side's messages as read…
create policy messages_read_talent on public.messages
  for update using (talent_id = public.current_talent_id() and not sender_is_talent)
  with check (talent_id = public.current_talent_id() and not sender_is_talent);

create policy messages_read_admin on public.messages
  for update using (public.is_admin() and sender_is_talent)
  with check (public.is_admin() and sender_is_talent);

-- …and chat history is immutable beyond that flag: UPDATE is limited to the
-- is_read column at the privilege level, and no DELETE policy exists.
revoke update on public.messages from authenticated;
grant  update (is_read) on public.messages to authenticated;

-- ----------------------------------------------------------------------------
-- TALENT OUT-DATES
-- ----------------------------------------------------------------------------

create table if not exists public.talent_unavailability (
  id         uuid primary key default gen_random_uuid(),
  talent_id  uuid not null references public.talent_profiles (id) on delete cascade,
  start_date date not null,
  end_date   date not null,
  reason     varchar(200),
  created_at timestamptz not null default now(),
  constraint talent_unavailability_range check (end_date >= start_date)
);

create index if not exists talent_unavailability_talent_idx
  on public.talent_unavailability (talent_id, start_date);

alter table public.talent_unavailability enable row level security;

create policy unavailability_select_own on public.talent_unavailability
  for select using (talent_id = public.current_talent_id());

create policy unavailability_select_admin on public.talent_unavailability
  for select using (public.is_admin());

create policy unavailability_insert_own on public.talent_unavailability
  for insert with check (talent_id = public.current_talent_id());

create policy unavailability_delete_own on public.talent_unavailability
  for delete using (talent_id = public.current_talent_id());

create policy unavailability_delete_admin on public.talent_unavailability
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- MEASUREMENTS — talent self-service (admins keep their existing policies)
-- ----------------------------------------------------------------------------

create policy talent_measurements_insert_own on public.talent_measurements
  for insert with check (talent_id = public.current_talent_id());

create policy talent_measurements_update_own on public.talent_measurements
  for update using (talent_id = public.current_talent_id())
  with check (talent_id = public.current_talent_id());
