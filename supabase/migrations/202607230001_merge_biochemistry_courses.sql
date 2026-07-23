-- Bioquímica and Bioquímica I represent the same DCB course.
do $$
declare
  v_keep uuid;
  v_remove uuid;
  v_keven uuid;
begin
  select id into v_keep
  from public.courses
  where lower(name) = lower('Bioquímica I')
  order by created_at
  limit 1;

  if v_keep is null then
    select id into v_keep
    from public.courses
    where lower(name) = lower('Bioquímica')
    order by created_at
    limit 1;
  end if;

  select id into v_remove
  from public.courses
  where lower(name) in (lower('Bioquímica'), lower('Bioquímica I'))
    and id <> v_keep
  order by created_at
  limit 1;

  if v_keep is null then
    return;
  end if;

  if v_remove is not null then
    -- Preserve dependent academic and financial records before removing the duplicate.
    update public.lessons set course_id = v_keep where course_id = v_remove;
    update public.materials set course_id = v_keep where course_id = v_remove;
    update public.payments set course_id = v_keep where course_id = v_remove;

    delete from public.enrollments duplicate
    using public.enrollments existing
    where duplicate.course_id = v_remove
      and existing.course_id = v_keep
      and duplicate.student_id = existing.student_id;
    update public.enrollments set course_id = v_keep where course_id = v_remove;

    delete from public.courses where id = v_remove;
  end if;

  update public.courses
  set
    name = 'Bioquímica',
    department = 'DCB',
    description = 'Compreenda as bases moleculares da vida, desde a estrutura e função das biomoléculas até às principais vias metabólicas e aos mecanismos de regulação celular.',
    price_monthly = 650,
    price_per_lesson = 150,
    max_tutors = 1,
    is_active = true,
    updated_at = now()
  where id = v_keep;

  select id into v_keven
  from public.profiles
  where lower(trim(full_name)) = lower('Keven Gulele')
    and role = 'EXPLICADOR'
    and status = 'active'
  limit 1;

  delete from public.course_tutors where course_id = v_keep;
  if v_keven is not null then
    insert into public.course_tutors (course_id, tutor_id, is_active)
    values (v_keep, v_keven, true);
  end if;
end $$;

notify pgrst, 'reload schema';
