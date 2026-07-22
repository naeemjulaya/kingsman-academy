-- Metadata for materials stored in a private Cloudflare R2 bucket.

alter table public.materials
  add column if not exists storage_provider text not null default 'EXTERNAL',
  add column if not exists object_key text,
  add column if not exists access_level text not null default 'FREE',
  add column if not exists mime_type text,
  add column if not exists original_name text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'materials_storage_provider_check'
  ) then
    alter table public.materials add constraint materials_storage_provider_check
      check (storage_provider in ('EXTERNAL', 'R2'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'materials_access_level_check'
  ) then
    alter table public.materials add constraint materials_access_level_check
      check (access_level in ('FREE', 'PREMIUM'));
  end if;
end $$;

create unique index if not exists materials_r2_object_key_unique
  on public.materials (object_key) where object_key is not null;
create index if not exists materials_course_access_index
  on public.materials (course_id, access_level);

create or replace function public.get_course_materials(p_course_id uuid)
returns table (
  id uuid,
  lesson_id uuid,
  title text,
  file_type text,
  file_size bigint,
  access_level text,
  original_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select m.id, m.lesson_id, m.title::text, m.file_type::text, m.file_size::bigint,
    m.access_level::text, m.original_name::text
  from public.materials m
  where m.course_id = p_course_id
  order by m.title;
$$;

revoke all on function public.get_course_materials(uuid) from public;
grant execute on function public.get_course_materials(uuid) to authenticated;

notify pgrst, 'reload schema';
