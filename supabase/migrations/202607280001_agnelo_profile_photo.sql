update public.profiles
set
  avatar_url = 'https://res.cloudinary.com/ddsjybint/image/upload/v1785232415/WhatsApp_Image_2026-07-27_at_18.28.11_lenahs.jpg',
  updated_at = now()
where id = 'f12f6bc9-9b1c-466a-9535-31edeb38ae75'
  and lower(full_name) = lower('Agnelo Vilanculo')
  and role = 'EXPLICADOR';
