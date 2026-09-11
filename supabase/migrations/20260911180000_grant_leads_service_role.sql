-- RLS bypass does not replace PostgreSQL table privileges. The server-only
-- Supabase secret authenticates as service_role and needs these operations for
-- lead creation, idempotency lookups, and future notification status updates.
grant select, insert, update on table public.leads to service_role;
