-- Official manual payment details shown during student checkout.
update public.platform_settings
set
  mpesa_number = '849418723',
  emola_number = '863312201',
  bank_details = 'BIM (NIB)' || chr(10) || '000100000103813561457',
  updated_at = now()
where id = true;

notify pgrst, 'reload schema';
