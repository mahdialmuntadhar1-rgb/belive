-- Seed 002: governorates
-- 17 governorates matching exactly what is stored in businesses.governorate
-- Arabic and Kurdish translations included.
--
-- IMPORTANT: name_en must match businesses.governorate values exactly.
--
-- Apply to live DB: YES (required — governorates table is empty/missing on live)

insert into public.governorates (name_en, name_ar, name_ku)
values
  ('Anbar',         'الأنبار',       'ئەنبار'),
  ('Babylon',       'بابل',          'بابل'),
  ('Baghdad',       'بغداد',         'بەغدا'),
  ('Basra',         'البصرة',        'بەسرە'),
  ('Dhi Qar',       'ذي قار',        'زی قار'),
  ('Diyala',        'ديالى',         'دیالە'),
  ('Duhok',         'دهوك',          'دهۆک'),
  ('Erbil',         'أربيل',         'هەولێر'),
  ('Karbala',       'كربلاء',        'کەربەلا'),
  ('Kirkuk',        'كركوك',         'کەرکووک'),
  ('Maysan',        'ميسان',         'میسان'),
  ('Muthanna',      'المثنى',        'موسەنا'),
  ('Najaf',         'النجف',         'نەجەف'),
  ('Nineveh',       'نينوى',         'نینەوا'),
  ('Qadisiyyah',    'القادسية',      'قادسیە'),
  ('Sulaymaniyah',  'السليمانية',    'سلێمانی'),
  ('Wasit',         'واسط',          'واست')
on conflict (name_en) do update
  set name_ar = excluded.name_ar,
      name_ku = excluded.name_ku;
