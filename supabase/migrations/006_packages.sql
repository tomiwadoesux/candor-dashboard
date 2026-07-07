-- ============================================================================
-- 006_packages.sql — Package Builder: shareable talent selections for clients
--
-- A "package" is a curated set of talent a booker sends to a client as an
-- expiring public link (/package/<token>). The public page is served to anon
-- users via SECURITY DEFINER functions (the token IS the credential), never
-- via direct table access — talent_profiles stays locked behind RLS.
-- ============================================================================

create table if not exists public.talent_packages (
  id           uuid primary key default gen_random_uuid(),
  title        varchar(255) not null,
  client_name  varchar(255),
  note         text,                              -- shown to the client at the top
  talent_ids   uuid[] not null default '{}',
  token        text not null unique,              -- unguessable share token
  expires_at   timestamptz,                       -- null = never expires
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists public.package_views (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid not null references public.talent_packages (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists idx_package_views_package_id on public.package_views (package_id);

alter table public.talent_packages enable row level security;
alter table public.package_views   enable row level security;

-- Admin-only management; anon/talent get nothing on the base tables.
drop policy if exists talent_packages_select_admin on public.talent_packages;
create policy talent_packages_select_admin on public.talent_packages
  for select using (public.is_admin());

drop policy if exists talent_packages_insert_admin on public.talent_packages;
create policy talent_packages_insert_admin on public.talent_packages
  for insert with check (public.is_admin());

drop policy if exists talent_packages_update_admin on public.talent_packages;
create policy talent_packages_update_admin on public.talent_packages
  for update using (public.is_admin());

drop policy if exists talent_packages_delete_admin on public.talent_packages;
create policy talent_packages_delete_admin on public.talent_packages
  for delete using (public.is_admin());

drop policy if exists package_views_select_admin on public.package_views;
create policy package_views_select_admin on public.package_views
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- Public access — SECURITY DEFINER, token-gated. Exposes only marketing-safe
-- talent fields plus measurements (clients need stats to book models).
-- ----------------------------------------------------------------------------
create or replace function public.get_package_by_token(p_token text)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select case when p.id is null then null else jsonb_build_object(
    'title', p.title,
    'client_name', p.client_name,
    'note', p.note,
    'expires_at', p.expires_at,
    'talent', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', tp.id,
        'first_name', tp.first_name,
        'last_name', tp.last_name,
        'category', tp.category,
        'primary_location', tp.primary_location,
        'instagram_handle', tp.instagram_handle,
        'bio', tp.bio,
        'polaroid_url', coalesce((
          select i.image_url from public.talent_portfolio_images i
          where i.talent_id = tp.id and i.is_primary_polaroid
          order by i.created_at desc limit 1
        ), tp.polaroid_url),
        'measurements', (
          select jsonb_build_object(
            'height_display', m.height_display, 'bust', m.bust, 'waist', m.waist,
            'hips', m.hips, 'shoe_uk', m.shoe_uk, 'hair_colour', m.hair_colour,
            'eye_colour', m.eye_colour, 'dress_size', m.dress_size)
          from public.talent_measurements m where m.talent_id = tp.id
        )
      ) order by array_position(p.talent_ids, tp.id))
      from public.talent_profiles tp
      where tp.id = any (p.talent_ids)
    ), '[]'::jsonb)
  ) end
  from (
    select * from public.talent_packages
    where token = p_token
      and (expires_at is null or expires_at > now())
    limit 1
  ) p;
$$;

create or replace function public.log_package_view(p_token text)
returns void
language sql security definer
set search_path = public
as $$
  insert into public.package_views (package_id)
  select id from public.talent_packages
  where token = p_token
    and (expires_at is null or expires_at > now());
$$;

grant execute on function public.get_package_by_token(text) to anon, authenticated;
grant execute on function public.log_package_view(text)     to anon, authenticated;
