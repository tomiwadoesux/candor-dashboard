-- ============================================================================
-- 004_functions.sql — scheduled/operational functions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- escalate_stale_notifications()
--
-- Marks a notification as escalated when it expects a talent response
-- (requires_response = true) and none has arrived within 10 hours of sending.
-- Escalated notifications surface in the admin dashboard's "Alerts" section
-- and the Communications "Escalated" tab.
--
-- Two passes:
--   1. Direct notifications: escalate when the single recipient hasn't responded.
--   2. Broadcast notifications (talent_id IS NULL): escalate when at least one
--      recipient row is still 'pending' past the deadline. The per-recipient
--      pending state remains queryable in notification_recipients.
--
-- SECURITY DEFINER so pg_cron / edge functions can run it without a user
-- context; RLS on notifications is bypassed by the function owner.
-- Returns the number of notifications newly escalated.
-- ----------------------------------------------------------------------------
create or replace function public.escalate_stale_notifications()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
  v_direct integer;
  v_broadcast integer;
begin
  -- Pass 1: direct (single-recipient) notifications.
  update public.notifications n
     set escalated = true,
         escalated_at = now()
   where n.requires_response
     and not n.escalated
     and n.talent_id is not null
     and n.response_status = 'pending'
     and n.created_at < now() - interval '10 hours';
  get diagnostics v_direct = row_count;

  -- Pass 2: broadcast notifications with at least one silent recipient.
  update public.notifications n
     set escalated = true,
         escalated_at = now()
   where n.requires_response
     and not n.escalated
     and n.talent_id is null
     and n.created_at < now() - interval '10 hours'
     and exists (
       select 1
       from public.notification_recipients nr
       where nr.notification_id = n.id
         and nr.response_status = 'pending'
     );
  get diagnostics v_broadcast = row_count;

  v_count := v_direct + v_broadcast;
  return v_count;
end;
$$;

-- Only the service side should invoke this; app users never call it directly.
revoke execute on function public.escalate_stale_notifications() from public, anon, authenticated;
grant execute on function public.escalate_stale_notifications() to service_role;

-- ----------------------------------------------------------------------------
-- Scheduling (pg_cron)
--
-- Enable the pg_cron extension in the Supabase dashboard (Database ->
-- Extensions -> pg_cron), then schedule an hourly sweep by running once:
--
--   select cron.schedule(
--     'escalate-stale-notifications',          -- job name
--     '0 * * * *',                             -- every hour on the hour
--     $job$ select public.escalate_stale_notifications(); $job$
--   );
--
-- To remove: select cron.unschedule('escalate-stale-notifications');
--
-- Not executed here because pg_cron is not enabled by default on every
-- project and CREATE EXTENSION pg_cron requires it to be allowed first.
-- ----------------------------------------------------------------------------
