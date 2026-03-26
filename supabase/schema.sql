-- Partner Logo Onboarding — run in Supabase SQL Editor (or via migration tooling)

create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type partner_status as enum ('pending', 'in_review', 'complete');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type logo_variant as enum ('primary', 'single_color', 'full_color', 'alternate_layout');
exception
  when duplicate_object then null;
end $$;

-- Tables
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  status partner_status not null default 'pending',
  created_at timestamptz not null default now(),
  completed_at timestamptz null
);

create table if not exists public.logo_uploads (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  variant logo_variant not null,
  file_path text not null,
  file_name text not null,
  is_required boolean not null default false,
  uploaded_at timestamptz not null default now(),
  unique (partner_id, variant)
);

create table if not exists public.partner_config (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  cobranded_portal boolean not null default false,
  powered_by_portal boolean not null default false,
  kit_activation_flow boolean not null default false,
  powered_by_kit_flow boolean not null default false,
  pdf_required boolean not null default false,
  powered_by_pdf boolean not null default false,
  partner_ops_dash_id text null,
  partner_id_prod text null,
  slug text null,
  completed_by text null,
  unique (partner_id)
);

-- RLS: partner submissions use service role only; admins use authenticated JWT
alter table public.partners enable row level security;
alter table public.logo_uploads enable row level security;
alter table public.partner_config enable row level security;

drop policy if exists "partners_select_auth" on public.partners;
create policy "partners_select_auth" on public.partners
  for select to authenticated using (true);

drop policy if exists "partners_update_auth" on public.partners;
create policy "partners_update_auth" on public.partners
  for update to authenticated using (true);

drop policy if exists "logo_uploads_select_auth" on public.logo_uploads;
create policy "logo_uploads_select_auth" on public.logo_uploads
  for select to authenticated using (true);

drop policy if exists "partner_config_select_auth" on public.partner_config;
create policy "partner_config_select_auth" on public.partner_config
  for select to authenticated using (true);

drop policy if exists "partner_config_insert_auth" on public.partner_config;
create policy "partner_config_insert_auth" on public.partner_config
  for insert to authenticated with check (true);

drop policy if exists "partner_config_update_auth" on public.partner_config;
create policy "partner_config_update_auth" on public.partner_config
  for update to authenticated using (true);

-- Storage bucket (private)
insert into storage.buckets (id, name, public)
values ('logos', 'logos', false)
on conflict (id) do nothing;

drop policy if exists "logos_read_auth" on storage.objects;
create policy "logos_read_auth" on storage.objects
  for select to authenticated using (bucket_id = 'logos');

-- Service role bypasses RLS for API routes (partner submit + signed URLs if needed)
