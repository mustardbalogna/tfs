-- Run this once in the Supabase SQL editor for your project.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
-- No policies are defined: the server-side API uses the Supabase service role
-- key, which bypasses RLS. This keeps the table unreachable from the browser's
-- public anon key, so messages can only be read/written via our own API.
grant select, insert, update, delete on public.messages to service_role;

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 1,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- Same reasoning as above: only the service role key touches this table.
grant select, insert, update, delete on public.rate_limits to service_role;

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  visitor_id text not null,
  session_id text not null default '',
  created_at timestamptz not null default now()
);

-- Safe to re-run on an existing table created before session_id existed.
alter table public.page_views add column if not exists session_id text not null default '';

create index if not exists page_views_created_at_idx on public.page_views (created_at);

alter table public.page_views enable row level security;
-- Same reasoning as above: only the service role key touches this table.
-- visitor_id/session_id are random anonymous ids generated client-side (no PII, no IP stored).
grant select, insert on public.page_views to service_role;
