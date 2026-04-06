-- Seed 001: categories
-- 10 categories matching exactly what is stored in businesses.category
-- Arabic and Kurdish translations included.
--
-- IMPORTANT: name_en must match businesses.category values exactly —
-- these strings are used as filter values in the WHERE clause.
--
-- Apply to live DB: YES (required — categories table is empty/missing on live)

insert into public.categories (name_en, name_ar, name_ku, icon_name, is_hot)
values
  (
    'Restaurants & Dining',
    'المطاعم والمأكولات',
    'چێشتخانە و خواردن',
    'Utensils',
    true
  ),
  (
    'Cafés & Coffee',
    'المقاهي والقهوة',
    'کافێ و قاوە',
    'Coffee',
    true
  ),
  (
    'Shopping & Retail',
    'التسوق والبيع بالتجزئة',
    'بازاڕکردن و فرۆشتن',
    'ShoppingBag',
    false
  ),
  (
    'Hotels & Stays',
    'الفنادق والإقامة',
    'هوتێل و مانەوە',
    'Hotel',
    false
  ),
  (
    'Health & Wellness',
    'الصحة والعافية',
    'تەندروستی و خۆش بوون',
    'HeartPulse',
    false
  ),
  (
    'Entertainment & Events',
    'الترفيه والفعاليات',
    'کات بەسەربردن و بۆنەکان',
    'Clapperboard',
    false
  ),
  (
    'Culture & Heritage',
    'الثقافة والتراث',
    'کولتوور و میراث',
    'Landmark',
    false
  ),
  (
    'Business Services',
    'خدمات الأعمال',
    'خزمەتگوزاری بازرگانی',
    'Briefcase',
    false
  ),
  (
    'Essential Services',
    'الخدمات الأساسية',
    'خزمەتگوزاری بنەڕەتی',
    'ShieldCheck',
    false
  ),
  (
    'Transport & Mobility',
    'النقل والتنقل',
    'گواستنەوە و جوڵان',
    'Car',
    false
  )
on conflict (name_en) do update
  set name_ar   = excluded.name_ar,
      name_ku   = excluded.name_ku,
      icon_name = excluded.icon_name,
      is_hot    = excluded.is_hot;
