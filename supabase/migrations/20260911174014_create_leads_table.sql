-- Leads received through the DEBORIX System Assistant.
create table public.leads (
  id uuid primary key default gen_random_uuid(),

  project_type text not null,
  estimated_budget text not null,
  contact_name text not null,
  email text not null,
  phone text,
  message text,

  idempotency_key uuid not null,

  notification_status text not null default 'pending',
  notification_error text,
  notification_attempts integer not null default 0,
  notified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint leads_idempotency_key_unique
    unique (idempotency_key),

  constraint leads_project_type_length
    check (
      char_length(btrim(project_type)) between 1 and 100
    ),

  constraint leads_estimated_budget_length
    check (
      char_length(btrim(estimated_budget)) between 1 and 100
    ),

  constraint leads_contact_name_length
    check (
      char_length(btrim(contact_name)) between 2 and 120
    ),

  constraint leads_email_length
    check (
      char_length(btrim(email)) between 3 and 254
    ),

  constraint leads_phone_length
    check (
      phone is null or char_length(phone) <= 30
    ),

  constraint leads_message_length
    check (
      message is null or char_length(message) <= 2000
    ),

  constraint leads_notification_status_valid
    check (
      notification_status in ('pending', 'sent', 'failed')
    ),

  constraint leads_notification_attempts_non_negative
    check (
      notification_attempts >= 0
    )
);

-- Useful for reviewing leads from newest to oldest.
create index leads_created_at_idx
  on public.leads (created_at desc);

-- Automatically maintain updated_at.
create function public.set_leads_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.set_leads_updated_at();

-- Leads are managed only through the protected Next.js backend.
alter table public.leads enable row level security;

-- No public RLS policies are intentionally created.
-- The server uses Supabase's service role, which must never reach the browser.
revoke all privileges on table public.leads from anon, authenticated;

comment on table public.leads is
  'Leads captured by the DEBORIX System Assistant. Server access only.';