alter table public.lessons
  add column if not exists access_level text;

update public.lessons
set access_level = 'PUBLIC'
where access_level is null
   or access_level not in ('PUBLIC', 'PRIVATE');

alter table public.lessons
  alter column access_level set default 'PUBLIC',
  alter column access_level set not null;

alter table public.lessons
  drop constraint if exists lessons_access_level_check;

alter table public.lessons
  add constraint lessons_access_level_check
  check (access_level in ('PUBLIC', 'PRIVATE'));

comment on column public.lessons.access_level is
  'PUBLIC: disponível a estudantes autenticados; PRIVATE: exige inscrição ativa e pagamento confirmado.';
