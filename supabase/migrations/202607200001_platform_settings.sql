-- Useful, shared platform settings. These replace browser-only/localStorage values.
alter table public.platform_settings
  add column if not exists platform_name text not null default 'Kingsman Academy',
  add column if not exists contact_email text not null default 'suporte@kingsman.academy',
  add column if not exists contact_phone text,
  add column if not exists logo_url text,
  add column if not exists mpesa_number text,
  add column if not exists emola_number text,
  add column if not exists bank_details text,
  add column if not exists payment_review_hours integer not null default 24
    check (payment_review_hours between 1 and 168);

comment on column public.platform_settings.payment_review_hours is
  'Expected manual payment review time shown to students, in hours.';

notify pgrst, 'reload schema';
