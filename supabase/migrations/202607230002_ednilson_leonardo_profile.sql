-- Add Ednilson Leonardo's public tutor biography and Cloudinary profile photo.

update public.profiles
set bio = 'Ednilson Leonardo é estudante da Licenciatura em Física na Universidade Eduardo Mondlane (UEM). Possui competências multidisciplinares em ciência de dados, com enfoque em aprendizagem automática (machine learning), cibersegurança e desenvolvimento de aplicações móveis com Flutter. Integra ainda a Associação de Astronomia (ADA), onde exerce as funções de secretário. Conta com experiência no ensino universitário, sobretudo nas disciplinas de Análise Matemática I, II e III, além de outras unidades curriculares dos cursos de Física e Matemática. A sua abordagem alia rigor científico, clareza e aplicação prática, tendo como principal objetivo elevar a qualidade da aprendizagem e ajudar os estudantes a alcançar resultados sólidos e a desenvolver competências académicas duradouras.',
    avatar_url = 'https://res.cloudinary.com/ddsjybint/image/upload/v1784826003/WhatsApp_Image_2026-07-23_at_13.58.31_z6uhiz.jpg',
    updated_at = now()
where lower(trim(full_name)) = any(array['ednilson leonardo', 'edinilson leonardo'])
  and role = 'EXPLICADOR';
