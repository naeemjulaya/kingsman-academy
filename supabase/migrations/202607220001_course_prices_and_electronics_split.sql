-- Set the current monthly fee and keep Digital and Analogue Electronics as
-- separate courses. The existing combined course becomes Digital Electronics
-- so that its lessons, materials, enrolments and payments retain their links.

do $$
declare
  v_digital_id uuid;
  v_analog_id uuid;
begin
  select id into v_digital_id
  from courses
  where lower(name) = lower('Electrónica Digital')
  order by created_at
  limit 1;

  if v_digital_id is null then
    update courses
    set name = 'Electrónica Digital', updated_at = now()
    where id = (
      select id
      from courses
      where lower(name) in (
        lower('Electrónica Digital e Analógica'),
        lower('Electrónica Digital e Electrónica Analógica')
      )
      order by created_at
      limit 1
    )
    returning id into v_digital_id;
  end if;

  if v_digital_id is null then
    insert into courses (
      name, department, university, description, price_monthly,
      price_per_lesson, max_tutors, is_active
    )
    values (
      'Electrónica Digital', 'Engenharia', 'UEM', '', 650, 150, 1, true
    )
    returning id into v_digital_id;
  end if;

  select id into v_analog_id
  from courses
  where lower(name) = lower('Electrónica Analógica')
  order by created_at
  limit 1;

  if v_analog_id is null then
    insert into courses (
      name, department, university, description, price_monthly,
      price_per_lesson, max_tutors, youtube_playlist_id, is_active
    )
    select
      'Electrónica Analógica', department, university, '', 650,
      price_per_lesson, max_tutors, null, is_active
    from courses
    where id = v_digital_id
    returning id into v_analog_id;
  end if;

  -- The combined catalogue assigned both tutors to the same record. Retain
  -- those assignments on each of the now-independent courses.
  insert into course_tutors (course_id, tutor_id, is_active)
  select v_analog_id, tutor_id, is_active
  from course_tutors
  where course_id = v_digital_id
  on conflict (course_id, tutor_id) do update
    set is_active = excluded.is_active;
end $$;

update courses
set price_monthly = 650, updated_at = now()
where price_monthly is distinct from 650;

notify pgrst, 'reload schema';
