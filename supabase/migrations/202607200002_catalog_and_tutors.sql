-- Authoritative course catalogue and multi-tutor assignments supplied on 2026-07-20.
-- This migration intentionally removes courses outside the approved catalogue,
-- including their dependent lessons, materials, enrollments and payments.

drop index if exists public.course_tutors_active_course_unique;

create or replace function public.admin_save_course_v2(
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
  p_tutor_ids uuid[]
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_course_id uuid; v_tutor_id uuid; v_ids uuid[] := coalesce(p_tutor_ids, '{}'::uuid[]);
begin
  if not public.is_admin() then raise exception 'Não autorizado' using errcode = '42501'; end if;
  if length(trim(p_name)) < 2 then raise exception 'Nome da cadeira inválido'; end if;
  if p_price_monthly < 0 or p_price_per_lesson < 0 or p_max_tutors < 1 then raise exception 'Preços ou limite inválidos'; end if;
  foreach v_tutor_id in array v_ids loop
    if not exists (select 1 from profiles where id=v_tutor_id and role in ('EXPLICADOR','ADMIN') and status='active') then
      raise exception 'Um dos explicadores selecionados não está ativo';
    end if;
  end loop;

  if p_id is null then
    insert into courses(name,department,university,description,price_monthly,price_per_lesson,max_tutors,youtube_playlist_id,is_active)
    values(trim(p_name),trim(p_department),trim(p_university),p_description,p_price_monthly,p_price_per_lesson,
      greatest(p_max_tutors,cardinality(v_ids),1),nullif(trim(p_youtube_playlist_id),''),p_is_active)
    returning id into v_course_id;
  else
    update courses set name=trim(p_name),department=trim(p_department),university=trim(p_university),description=p_description,
      price_monthly=p_price_monthly,price_per_lesson=p_price_per_lesson,max_tutors=greatest(p_max_tutors,cardinality(v_ids),1),
      youtube_playlist_id=nullif(trim(p_youtube_playlist_id),''),is_active=p_is_active,updated_at=now()
    where id=p_id returning id into v_course_id;
    if v_course_id is null then raise exception 'Cadeira não encontrada'; end if;
  end if;

  update course_tutors set is_active=false where course_id=v_course_id and not (tutor_id=any(v_ids));
  insert into course_tutors(course_id,tutor_id,is_active)
    select v_course_id,id,true from unnest(v_ids) as id
    on conflict (course_id,tutor_id) do update set is_active=true;
  return v_course_id;
end $$;

revoke all on function public.admin_save_course_v2(uuid,text,text,text,text,numeric,numeric,integer,text,boolean,uuid[]) from public;
grant execute on function public.admin_save_course_v2(uuid,text,text,text,text,numeric,numeric,integer,text,boolean,uuid[]) to authenticated;

-- Normalize names that already exist in the current database.
update courses set name='Análise Matemática', updated_at=now() where name='Análise Matemática II';
update courses set name='Bioquímica I', updated_at=now() where name='Bioquímica Metabólica e Fisiologia I';
update courses set name='Electrónica Digital e Analógica', updated_at=now() where name='Electrónica Digital e Electrónica Analógica';
update courses set name='Fisiologia Animal', updated_at=now() where name='Fisiologia Animal Funcional';
update courses set name='Física', updated_at=now() where name='Física II';

insert into courses(name,department,university,description,price_monthly,price_per_lesson,max_tutors,is_active)
select 'Álgebra Linear','Matemática','UEM','',750,150,1,true
where not exists (select 1 from courses where lower(name)=lower('Álgebra Linear'));

create temp table desired_courses(name text primary key) on commit drop;
insert into desired_courses values
  ('Álgebra Linear'),('Alga'),('Análise Matemática'),('Bioestatística'),('Bioquímica I'),
  ('Electrónica Digital e Analógica'),('Entomologia'),('Fisiologia Animal'),('Física'),('Química Orgânica');

create temp table desired_tutors(canonical text primary key, aliases text[]) on commit drop;
insert into desired_tutors values
  ('Keven Gulele',array['keven gulele','keven']),
  ('Agnelo Vilanculo',array['agnelo vilanculo']),
  ('Naeem Julaya',array['naeem julaya']),
  ('Edinilson Leonardo',array['edinilson leonardo','ednilson leonardo']),
  ('Nilzam Bakali',array['nilzam bakali']),
  ('Dulce Ezequiel',array['dulce ezequiel']),
  ('Jônatas Bana',array['jônatas bana','jonatas bana']),
  ('Virgínia Tembe',array['virgínia tembe','virginia tembe']);

-- A profile has a single primary role. Keep administrators as administrators
-- (they may also teach), and normalize every other catalog tutor to EXPLICADOR.
update profiles p
set role='EXPLICADOR'
where p.role <> 'ADMIN'
  and exists (
    select 1 from desired_tutors dt
    where lower(trim(p.full_name))=any(dt.aliases)
  );

create temp table desired_assignments(course_name text, tutor_name text) on commit drop;
insert into desired_assignments values
  ('Álgebra Linear','Keven Gulele'),
  ('Alga','Agnelo Vilanculo'),
  ('Análise Matemática','Naeem Julaya'),('Análise Matemática','Edinilson Leonardo'),
  ('Bioestatística','Nilzam Bakali'),('Bioestatística','Dulce Ezequiel'),
  ('Bioquímica I','Keven Gulele'),('Bioquímica I','Nilzam Bakali'),
  ('Electrónica Digital e Analógica','Naeem Julaya'),('Electrónica Digital e Analógica','Edinilson Leonardo'),
  ('Entomologia','Jônatas Bana'),
  ('Fisiologia Animal','Keven Gulele'),('Fisiologia Animal','Virgínia Tembe'),
  ('Física','Edinilson Leonardo'),
  ('Química Orgânica','Keven Gulele');

do $$
declare missing text;
begin
  select string_agg(dt.canonical,', ') into missing
  from desired_tutors dt
  where not exists (
    select 1 from profiles p
    where lower(trim(p.full_name))=any(dt.aliases)
      and p.role in ('EXPLICADOR','ADMIN')
      and p.status='active'
  );
  if missing is not null then raise exception 'Crie ou ative estes explicadores antes de aplicar o catálogo: %',missing; end if;
end $$;

-- Remove all dependent records belonging to courses outside the approved list.
create temp table removed_courses(id uuid primary key) on commit drop;
insert into removed_courses select c.id from courses c where not exists (select 1 from desired_courses d where lower(d.name)=lower(c.name));
delete from lesson_completions lc using lessons l,removed_courses r where lc.lesson_id=l.id and l.course_id=r.id;
delete from materials m using removed_courses r where m.course_id=r.id;
delete from lessons l using removed_courses r where l.course_id=r.id;
delete from payments p using removed_courses r where p.course_id=r.id;
delete from enrollments e using removed_courses r where e.course_id=r.id;
delete from course_tutors ct using removed_courses r where ct.course_id=r.id;
delete from courses c using removed_courses r where c.id=r.id;

-- Replace all active assignments for the approved catalogue.
update course_tutors ct set is_active=false
from courses c,desired_courses d where ct.course_id=c.id and lower(c.name)=lower(d.name);

insert into course_tutors(course_id,tutor_id,is_active)
select c.id,p.id,true
from desired_assignments a
join courses c on lower(c.name)=lower(a.course_name)
join desired_tutors dt on dt.canonical=a.tutor_name
join lateral (
  select p.id from profiles p where lower(trim(p.full_name))=any(dt.aliases) and p.status='active' order by p.created_at limit 1
) p on true
on conflict (course_id,tutor_id) do update set is_active=true;

update courses c set max_tutors=x.total,updated_at=now()
from (select course_name,count(*)::integer total from desired_assignments group by course_name) x
where lower(c.name)=lower(x.course_name);

notify pgrst,'reload schema';
