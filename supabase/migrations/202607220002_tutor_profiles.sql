-- Rich tutor profiles shown to students before enrolment.

alter table public.profiles
  add column if not exists bio text;

update public.profiles
set bio = 'Licenciando em Biologia Aplicada pela Universidade Eduardo Mondlane (UEM), conta com cerca de três anos de experiência como explicador. Possui experiência no ensino de Biologia, Química, Matemática e Física no nível secundário, bem como de disciplinas universitárias como Bioquímica, Fisiologia Animal, Álgebra, Química Orgânica, Química Analítica e Bioestatística I e II. Dedica-se a proporcionar aulas claras, interativas e orientadas para resultados, ajudando cada estudante a desenvolver confiança, domínio dos conteúdos e um desempenho académico de excelência.',
    avatar_url = 'https://res.cloudinary.com/ddsjybint/image/upload/v1784727447/keven_yzixgu.jpg',
    updated_at = now()
where lower(trim(full_name)) = any(array['keven gulele', 'keven']);

update public.profiles
set bio = 'Licencianda em Ciências Biológicas pela Universidade Eduardo Mondlane (UEM), possui experiência em explicações e acompanhamento académico de estudantes universitários, com especial destaque para a área de Estatística. A sua metodologia combina clareza, aplicação prática e acompanhamento próximo, promovendo uma compreensão sólida dos conteúdos, maior confiança e um desempenho académico consistente.',
    avatar_url = 'https://res.cloudinary.com/ddsjybint/image/upload/v1784727460/dulce_xgovcc.jpg',
    updated_at = now()
where lower(trim(full_name)) = any(array['dulce nesmah ezequiel', 'dulce ezequiel']);

update public.profiles
set bio = 'Licencianda em Biologia Aplicada pela Universidade Eduardo Mondlane (UEM), possui experiência em explicações de Biologia e Química. O seu percurso inclui a participação em grupos de exposição científica no ensino secundário e uma sólida experiência de liderança estudantil. Destaca-se pela capacidade de trabalho em equipa, pela proximidade com os estudantes e pela facilidade em transmitir conteúdos académicos de forma clara, acessível e envolvente.',
    avatar_url = 'https://res.cloudinary.com/ddsjybint/image/upload/v1784727453/virginia_gya5sh.jpg',
    updated_at = now()
where lower(trim(full_name)) = any(array['virgínia luís tembe', 'virginia luis tembe', 'virgínia tembe', 'virginia tembe']);

update public.profiles
set bio = 'Naeem Osama Julaya é licenciando em Engenharia Informática pela Universidade Eduardo Mondlane (UEM) e explicador nas áreas de Análise Matemática II, Eletrónica Digital e Eletrónica Analógica. Destaca-se por uma abordagem clara, estruturada e orientada para a compreensão dos conceitos, ajudando os estudantes a desenvolver raciocínio lógico, confiança e um desempenho académico consistente através de explicações objetivas e da resolução prática de exercícios. “Com dedicação, orientação certa e método, a dispensa deixa de ser um objetivo distante e torna-se uma consequência natural do seu esforço.”',
    avatar_url = 'https://res.cloudinary.com/ddsjybint/image/upload/v1784732806/nnn_fwzgrm.png',
    updated_at = now()
where lower(trim(full_name)) = any(array['naeem osama julaya', 'naeem julaya']);

-- Expose only the public fields required by the course page. Using a dedicated
-- function avoids opening complete profile records (email and phone included)
-- through the profiles table RLS policies.
create or replace function public.get_course_tutors(p_course_id uuid)
returns table (
  id uuid,
  full_name text,
  university text,
  bio text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.university, p.bio, p.avatar_url
  from public.course_tutors ct
  join public.profiles p on p.id = ct.tutor_id
  where ct.course_id = p_course_id
    and ct.is_active = true
    and p.status = 'active'
    and p.role in ('EXPLICADOR', 'ADMIN')
  order by p.full_name;
$$;

revoke all on function public.get_course_tutors(uuid) from public;
grant execute on function public.get_course_tutors(uuid) to authenticated;

notify pgrst, 'reload schema';
