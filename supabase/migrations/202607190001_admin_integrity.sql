-- Administrative integrity and atomic workflows.
-- Apply with `supabase db push` after reviewing against the target project.

create unique index if not exists profiles_email_unique_ci on public.profiles (lower(email));
create unique index if not exists profiles_user_id_unique on public.profiles (user_id);
create unique index if not exists courses_name_university_unique_ci
  on public.courses (lower(name), lower(coalesce(university, '')));
create unique index if not exists enrollments_student_course_unique
  on public.enrollments (student_id, course_id);
create unique index if not exists course_tutors_active_course_unique
  on public.course_tutors (course_id) where is_active = true;
create unique index if not exists course_tutors_course_tutor_unique
  on public.course_tutors (course_id, tutor_id);

create table if not exists public.platform_settings (
  id boolean primary key default true check (id),
  facebook_url text,
  instagram_url text,
  youtube_url text,
  linkedin_url text,
  whatsapp_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
insert into public.platform_settings (id) values (true) on conflict (id) do nothing;
alter table public.platform_settings enable row level security;

drop policy if exists "social links are public" on public.platform_settings;
create policy "social links are public" on public.platform_settings for select using (true);
drop policy if exists "admins update social links" on public.platform_settings;
create policy "admins update social links" on public.platform_settings for update to authenticated
using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'ADMIN'))
with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'ADMIN'));

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from profiles where user_id = auth.uid() and role = 'ADMIN') $$;

-- Every Auth identity must have exactly one application profile.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(user_id, full_name, email, avatar_url, role, status)
  values(
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1), 'Utilizador'),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    'ESTUDANTE',
    'active'
  )
  on conflict (user_id) do update set
    email=excluded.email,
    full_name=case when profiles.full_name is null or profiles.full_name='' then excluded.full_name else profiles.full_name end;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert or update of email on auth.users
for each row execute function public.handle_new_user();

-- Repair Auth accounts created before the trigger existed.
insert into public.profiles(user_id, full_name, email, role, status)
select
  u.id,
  coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1), 'Utilizador'),
  coalesce(u.email, ''),
  'ESTUDANTE',
  'active'
from auth.users u
where not exists (select 1 from public.profiles p where p.user_id = u.id)
on conflict (user_id) do nothing;

create or replace function public.protect_profile_privileges()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.user_id := old.user_id;
    new.email := old.email;
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges before update on public.profiles
for each row execute function public.protect_profile_privileges();

alter table public.profiles enable row level security;
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select to authenticated
using (user_id = auth.uid() or public.is_admin());
drop policy if exists "users create own profile" on public.profiles;
create policy "users create own profile" on public.profiles for insert to authenticated
with check (user_id = auth.uid() and role = 'ESTUDANTE');
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create or replace function public.admin_save_course(
  p_id uuid,
  p_name text,
  p_department text,
  p_university text,
  p_description text,
  p_price_monthly numeric,
  p_price_per_lesson numeric,
  p_max_tutors integer,
  p_youtube_playlist_id text,
  p_is_active boolean,
  p_tutor_id uuid
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_course_id uuid;
begin
  if not public.is_admin() then raise exception 'Não autorizado' using errcode = '42501'; end if;
  if length(trim(p_name)) < 2 then raise exception 'Nome da cadeira inválido'; end if;
  if p_price_monthly < 0 or p_price_per_lesson < 0 or p_max_tutors < 1 then
    raise exception 'Preços ou limite de explicadores inválidos';
  end if;
  if p_tutor_id is not null and not exists (
    select 1 from profiles where id = p_tutor_id and role = 'EXPLICADOR' and status = 'active'
  ) then raise exception 'O explicador selecionado não está ativo'; end if;

  if p_id is null then
    insert into courses(name, department, university, description, price_monthly, price_per_lesson,
      max_tutors, youtube_playlist_id, is_active)
    values(trim(p_name), trim(p_department), trim(p_university), p_description, p_price_monthly,
      p_price_per_lesson, p_max_tutors, nullif(trim(p_youtube_playlist_id), ''), p_is_active)
    returning id into v_course_id;
  else
    update courses set name=trim(p_name), department=trim(p_department), university=trim(p_university),
      description=p_description, price_monthly=p_price_monthly, price_per_lesson=p_price_per_lesson,
      max_tutors=p_max_tutors, youtube_playlist_id=nullif(trim(p_youtube_playlist_id), ''),
      is_active=p_is_active, updated_at=now()
    where id=p_id returning id into v_course_id;
    if v_course_id is null then raise exception 'Cadeira não encontrada'; end if;
  end if;

  update course_tutors set is_active=false where course_id=v_course_id and is_active=true
    and (p_tutor_id is null or tutor_id <> p_tutor_id);
  if p_tutor_id is not null then
    insert into course_tutors(course_id, tutor_id, is_active)
    values(v_course_id, p_tutor_id, true)
    on conflict (course_id, tutor_id) do update set is_active=true;
  end if;
  return v_course_id;
end $$;

create or replace function public.admin_update_enrollment(p_enrollment_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Não autorizado' using errcode = '42501'; end if;
  if p_status not in ('ACTIVE','CANCELLED','EXPIRED') then raise exception 'Estado inválido'; end if;
  update enrollments set
    status=p_status,
    payment_status=case when p_status='ACTIVE' then 'CONFIRMED' else payment_status end,
    start_date=case when p_status='ACTIVE' then coalesce(start_date, now()) else start_date end,
    updated_at=now()
  where id=p_enrollment_id;
  if not found then raise exception 'Inscrição não encontrada'; end if;
end $$;

create or replace function public.admin_validate_payment(p_payment_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public
as $$
declare v_student_id uuid; v_course_id uuid;
begin
  if not public.is_admin() then raise exception 'Não autorizado' using errcode = '42501'; end if;
  if p_status not in ('CONFIRMED','REJECTED') then raise exception 'Estado inválido'; end if;
  update payments set status=p_status, confirmed_by=auth.uid(), confirmed_at=now(), updated_at=now()
    where id=p_payment_id returning student_id, course_id into v_student_id, v_course_id;
  if not found then raise exception 'Pagamento não encontrado'; end if;
  insert into enrollments(student_id, course_id, status, payment_status, start_date)
    values(v_student_id, v_course_id,
      case when p_status='CONFIRMED' then 'ACTIVE' else 'PENDING' end,
      p_status, case when p_status='CONFIRMED' then now() else null end)
  on conflict (student_id, course_id) do update set
    status=case when p_status='CONFIRMED' then 'ACTIVE' else enrollments.status end,
    payment_status=p_status,
    start_date=case when p_status='CONFIRMED' then coalesce(enrollments.start_date, now()) else enrollments.start_date end,
    updated_at=now();
end $$;

revoke all on function public.admin_save_course(uuid,text,text,text,text,numeric,numeric,integer,text,boolean,uuid) from public;
revoke all on function public.admin_update_enrollment(uuid,text) from public;
revoke all on function public.admin_validate_payment(uuid,text) from public;
grant execute on function public.admin_save_course(uuid,text,text,text,text,numeric,numeric,integer,text,boolean,uuid) to authenticated;
grant execute on function public.admin_update_enrollment(uuid,text) to authenticated;
grant execute on function public.admin_validate_payment(uuid,text) to authenticated;
