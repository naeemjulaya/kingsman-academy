-- Social networks and payment-aware WhatsApp group links.

alter table public.platform_settings
  add column if not exists tiktok_url text;

update public.platform_settings
set facebook_url = 'https://www.facebook.com/profile.php?id=61592054880342',
    youtube_url = 'https://www.youtube.com/@KINGSMANGulele',
    instagram_url = 'https://www.instagram.com/kinsgman.academy.mz?igsh=MTk2MW5ueTgzZDl3ZQ==',
    updated_at = now()
where id = true;

create table if not exists public.course_tutor_resources (
  course_id uuid not null references public.courses(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  whatsapp_group_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  primary key (course_id, tutor_id)
);

alter table public.course_tutor_resources enable row level security;

create or replace function public.save_course_whatsapp_link(
  p_course_id uuid,
  p_tutor_id uuid,
  p_whatsapp_group_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and not exists (
    select 1 from public.profiles p
    where p.id = p_tutor_id and p.user_id = auth.uid() and p.status = 'active'
  ) then
    raise exception 'Não autorizado' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.course_tutors
    where course_id = p_course_id and tutor_id = p_tutor_id and is_active = true
  ) then
    raise exception 'Associação entre cadeira e explicador não encontrada';
  end if;

  insert into public.course_tutor_resources (
    course_id, tutor_id, whatsapp_group_url, updated_at, updated_by
  ) values (
    p_course_id, p_tutor_id, nullif(trim(p_whatsapp_group_url), ''), now(), auth.uid()
  )
  on conflict (course_id, tutor_id) do update set
    whatsapp_group_url = excluded.whatsapp_group_url,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;
end;
$$;

create or replace function public.get_tutor_resource_links()
returns table (
  course_id uuid,
  tutor_id uuid,
  whatsapp_group_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, p.id, resources.whatsapp_group_url
  from public.courses c
  join public.course_tutors ct on ct.course_id = c.id and ct.is_active = true
  join public.profiles p on p.id = ct.tutor_id
  left join public.course_tutor_resources resources
    on resources.course_id = c.id and resources.tutor_id = p.id
  where public.is_admin() or p.user_id = auth.uid();
$$;

create or replace function public.get_student_course_resources()
returns table (
  course_id uuid,
  course_name text,
  tutor_id uuid,
  tutor_name text,
  whatsapp_group_url text,
  has_paid_access boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.name,
    p.id,
    p.full_name,
    case when access.allowed then resources.whatsapp_group_url else null end,
    access.allowed
  from public.courses c
  left join public.course_tutors ct on ct.course_id = c.id and ct.is_active = true
  left join public.profiles p on p.id = ct.tutor_id and p.status = 'active'
  left join public.course_tutor_resources resources
    on resources.course_id = c.id and resources.tutor_id = p.id
  cross join lateral (
    select exists (
      select 1
      from public.enrollments e
      where e.course_id = c.id
        and e.student_id in (
          auth.uid(),
          coalesce((select profile.id from public.profiles profile where profile.user_id = auth.uid() limit 1), auth.uid())
        )
        and e.status = 'ACTIVE'
        and e.payment_status = 'CONFIRMED'
        and (e.end_date is null or e.end_date > now())
    ) as allowed
  ) access
  where c.is_active = true
  order by c.name, p.full_name;
$$;

revoke all on function public.save_course_whatsapp_link(uuid,uuid,text) from public;
revoke all on function public.get_tutor_resource_links() from public;
revoke all on function public.get_student_course_resources() from public;
grant execute on function public.save_course_whatsapp_link(uuid,uuid,text) to authenticated;
grant execute on function public.get_tutor_resource_links() to authenticated;
grant execute on function public.get_student_course_resources() to authenticated;

notify pgrst, 'reload schema';
