-- Aggregate dashboard data in PostgreSQL so the API never downloads an
-- unbounded collection of leads. All day boundaries use UTC consistently.
create or replace function public.get_lead_dashboard_stats()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with boundaries as (
    select (now() at time zone 'UTC')::date as today_date
  ),
  metrics as (
    select
      count(*)::integer as total_leads,
      count(*) filter (
        where leads.created_at >= (boundaries.today_date::timestamp at time zone 'UTC')
      )::integer as leads_today,
      count(*) filter (
        where leads.created_at >= ((boundaries.today_date - 6)::timestamp at time zone 'UTC')
      )::integer as leads_last_seven_days,
      count(*) filter (where leads.notification_status = 'sent')::integer as notifications_sent,
      count(*) filter (where leads.notification_status = 'failed')::integer as notifications_failed
    from public.leads
    cross join boundaries
  ),
  days as (
    select (boundaries.today_date - offsets.days_ago)::date as day
    from boundaries
    cross join generate_series(0, 29) as offsets(days_ago)
  ),
  daily_counts as (
    select
      days.day,
      count(leads.id)::integer as lead_count
    from days
    left join public.leads
      on leads.created_at >= (days.day::timestamp at time zone 'UTC')
      and leads.created_at < ((days.day + 1)::timestamp at time zone 'UTC')
    group by days.day
  ),
  project_type_counts as (
    select
      leads.project_type,
      count(*)::integer as lead_count
    from public.leads
    cross join boundaries
    where leads.created_at >= ((boundaries.today_date - 29)::timestamp at time zone 'UTC')
    group by leads.project_type
  ),
  notification_statuses(status, position) as (
    values ('sent'::text, 1), ('pending'::text, 2), ('failed'::text, 3)
  ),
  notification_status_counts as (
    select
      notification_statuses.status,
      notification_statuses.position,
      count(leads.id)::integer as lead_count
    from notification_statuses
    cross join boundaries
    left join public.leads
      on leads.notification_status = notification_statuses.status
      and leads.created_at >= ((boundaries.today_date - 29)::timestamp at time zone 'UTC')
    group by notification_statuses.status, notification_statuses.position
  )
  select jsonb_build_object(
    'totalLeads', metrics.total_leads,
    'leadsToday', metrics.leads_today,
    'leadsLastSevenDays', metrics.leads_last_seven_days,
    'notificationsSent', metrics.notifications_sent,
    'notificationsFailed', metrics.notifications_failed,
    'dailyLeads', coalesce((
      select jsonb_agg(
        jsonb_build_object('date', daily_counts.day::text, 'count', daily_counts.lead_count)
        order by daily_counts.day
      )
      from daily_counts
    ), '[]'::jsonb),
    'leadsByProjectType', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'projectType', project_type_counts.project_type,
          'count', project_type_counts.lead_count
        )
        order by project_type_counts.lead_count desc, project_type_counts.project_type
      )
      from project_type_counts
    ), '[]'::jsonb),
    'leadsByNotificationStatus', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'status', notification_status_counts.status,
          'count', notification_status_counts.lead_count
        )
        order by notification_status_counts.position
      )
      from notification_status_counts
    ), '[]'::jsonb)
  )
  from metrics;
$$;

revoke all on function public.get_lead_dashboard_stats() from public, anon, authenticated;
grant execute on function public.get_lead_dashboard_stats() to service_role;

comment on function public.get_lead_dashboard_stats() is
  'Returns aggregate lead dashboard statistics using UTC day boundaries.';
