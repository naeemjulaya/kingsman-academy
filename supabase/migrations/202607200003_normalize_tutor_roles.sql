-- Normalize the authoritative teaching staff after the catalog migration.
-- Administrators retain their role and can still teach; every other matched
-- profile becomes EXPLICADOR so it appears consistently in admin workflows.

update public.profiles p
set role = 'EXPLICADOR'
where p.role <> 'ADMIN'
  and lower(trim(p.full_name)) = any(array[
    'keven gulele',
    'keven',
    'agnelo vilanculo',
    'naeem julaya',
    'edinilson leonardo',
    'ednilson leonardo',
    'nilzam bakali',
    'dulce ezequiel',
    'jônatas bana',
    'jonatas bana',
    'virgínia tembe',
    'virginia tembe'
  ]);

do $$
declare missing text;
begin
  select string_agg(expected_name, ', ')
  into missing
  from (values
    ('Keven Gulele', array['keven gulele','keven']),
    ('Agnelo Vilanculo', array['agnelo vilanculo']),
    ('Naeem Julaya', array['naeem julaya']),
    ('Edinilson Leonardo', array['edinilson leonardo','ednilson leonardo']),
    ('Nilzam Bakali', array['nilzam bakali']),
    ('Dulce Ezequiel', array['dulce ezequiel']),
    ('Jônatas Bana', array['jônatas bana','jonatas bana']),
    ('Virgínia Tembe', array['virgínia tembe','virginia tembe'])
  ) as expected(expected_name, aliases)
  where not exists (
    select 1
    from public.profiles p
    where lower(trim(p.full_name)) = any(expected.aliases)
      and p.role in ('EXPLICADOR','ADMIN')
      and p.status = 'active'
  );

  if missing is not null then
    raise exception 'Perfis de explicador ainda ausentes ou inativos: %', missing;
  end if;
end $$;

notify pgrst, 'reload schema';
