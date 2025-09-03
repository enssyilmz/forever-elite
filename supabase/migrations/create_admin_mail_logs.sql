-- Ensure UUID generation available
create extension if not exists pgcrypto;

create table if not exists public.admin_mail_logs (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  recipients text[] not null,
  sent_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.admin_mail_logs enable row level security;

-- Admin can read; no public insert; inserts are via service role only
create policy "read mail logs"
  on public.admin_mail_logs
  for select
  to authenticated
  using (true);

