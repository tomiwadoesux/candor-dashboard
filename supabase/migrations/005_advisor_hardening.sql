-- ============================================================================
-- 005_advisor_hardening.sql — fixes from Supabase security advisors
-- (applied to the live project on 2026-07-07)
-- ============================================================================

-- anon never needs to call the role helpers via RPC (RLS policies run for
-- authenticated users; anon only touches the SECURITY DEFINER public_roster).
revoke execute on function public.current_user_role() from anon;
revoke execute on function public.is_admin()          from anon;
revoke execute on function public.is_md_or_ceo()      from anon;
revoke execute on function public.current_talent_id() from anon;
revoke execute on function public.handle_new_user()   from anon, authenticated;

-- Pin search_path on the trigger function (advisor: function_search_path_mutable).
alter function public.set_updated_at() set search_path = public;

-- casting_analytics_view can run as invoker: md/ceo already have SELECT
-- policies on talent_profiles + casting_interests, and the internal
-- is_md_or_ceo() gate stays. open_castings_public and public_roster remain
-- SECURITY DEFINER by design — they ARE the security boundary (see 002_rls.sql);
-- the advisor's security_definer_view errors on those two are accepted.
drop view if exists public.casting_analytics_view;
create view public.casting_analytics_view
with (security_invoker = true) as
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
