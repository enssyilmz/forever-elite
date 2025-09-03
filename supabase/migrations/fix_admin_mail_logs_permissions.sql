-- Ensure authenticated role can read admin_mail_logs
grant usage on schema public to authenticated;
grant select on table public.admin_mail_logs to authenticated;

-- Helpful index for ordering by created_at
create index if not exists admin_mail_logs_created_at_idx on public.admin_mail_logs(created_at desc);

