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

-- Categories CMS -------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  heading text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Case-insensitive uniqueness so "Chairs" and "chairs" can't both exist.
create unique index if not exists categories_name_lower_idx on public.categories (lower(name));

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
-- Same reasoning as above: only the service role key touches this table, and
-- our /api/categories route enforces the admin session check for writes.
-- GET (public listing) also goes through that same route, using service role,
-- so no anon/public RLS policy is needed or granted here.
grant select, insert, update, delete on public.categories to service_role;

create table if not exists public.category_images (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists category_images_category_id_idx
  on public.category_images (category_id, sort_order);

alter table public.category_images enable row level security;
grant select, insert, update, delete on public.category_images to service_role;

-- Storage: create a bucket named "category-images" via the Supabase dashboard
-- (Storage > New bucket) or CLI — this can't be scripted here in plain SQL.
-- Make it a "Public" bucket so uploaded images can be served directly via
-- their public URL (they're non-sensitive marketing photos). All uploads and
-- deletes still go through our /api routes using the service role key, which
-- bypasses storage RLS, so no extra storage policies need to be added.

-- One-off migration of the categories that used to be hard-coded in
-- src/pages/Categories.tsx. Heading defaults to the name and description is a
-- placeholder — edit these from /admin/categories after running this once.
insert into public.categories (name, heading, description)
values
  ('Cabinet Making', 'Cabinet Making', 'Custom cabinet making services.'),
  ('Benchtops', 'Benchtops', 'Benchtop supply and installation.'),
  ('Home Office', 'Home Office', 'Custom home office furniture and fitouts.'),
  ('Built-in Furniture', 'Built-in Furniture', 'Custom built-in furniture solutions.'),
  ('Bookcases', 'Bookcases', 'Custom built bookcases.'),
  ('Chairs', 'Chairs', 'Custom built chairs.'),
  ('Furniture - Chairs', 'Furniture - Chairs', 'Chair furniture services.'),
  ('Dining Tables', 'Dining Tables', 'Custom dining tables made to measure.'),
  ('Furniture - Custom Design', 'Furniture - Custom Design', 'Bespoke custom furniture design.'),
  ('Custom Built Chairs', 'Custom Built Chairs', 'Chairs built to your specifications.'),
  ('Entertainment Units', 'Entertainment Units', 'Custom entertainment units and media cabinets.'),
  ('Cabinets', 'Cabinets', 'Custom cabinet solutions.'),
  ('Custom Built Tables', 'Custom Built Tables', 'Tables built to your specifications.'),
  ('Custom Built Storage Solutions', 'Custom Built Storage Solutions', 'Storage solutions built to order.'),
  ('Consultation', 'Consultation', 'Design and project consultation services.'),
  ('Furniture - Outdoor', 'Furniture - Outdoor', 'Outdoor furniture services.'),
  ('Joinery', 'Joinery', 'Professional joinery services.'),
  ('Shop & Office Fitouts', 'Shop & Office Fitouts', 'Commercial shop and office fitouts.'),
  ('Furniture', 'Furniture', 'General furniture services.'),
  ('Kitchens', 'Kitchens', 'Custom kitchen design and installation.'),
  ('Wardrobes', 'Wardrobes', 'Custom wardrobe solutions.'),
  ('Standalone Wardrobe Builders', 'Standalone Wardrobe Builders', 'Standalone wardrobe building services.'),
  ('Built In Wardrobe Builders', 'Built In Wardrobe Builders', 'Built-in wardrobe building services.'),
  ('Shelving & Storage Solutions', 'Shelving & Storage Solutions', 'Shelving and storage solutions.')
on conflict (lower(name)) do nothing;
