-- Migration 007: Metadata Tables
-- Creates categories, governorates, and cities tables

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_ku TEXT NOT NULL,
  icon TEXT,
  image_url TEXT,
  types INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Governorates table
CREATE TABLE IF NOT EXISTS public.governorates (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_ku TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cities table
CREATE TABLE IF NOT EXISTS public.cities (
  id TEXT PRIMARY KEY,
  governorate_id TEXT REFERENCES public.governorates(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_ku TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on metadata tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read metadata
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view governorates"
  ON public.governorates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view cities"
  ON public.cities FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies: Service role can manage metadata
CREATE POLICY "Service role can manage categories"
  ON public.categories FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage governorates"
  ON public.governorates FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage cities"
  ON public.cities FOR ALL
  TO service_role
  USING (true);

-- Insert initial data
INSERT INTO public.categories (id, name_en, name_ar, name_ku, types, is_hot) VALUES
  ('hotels', 'HOTELS & STAYS', 'الفنادق والإقامة', 'هوتێل و مانەوە', 3, FALSE),
  ('dining', 'RESTAURANTS & DINING', 'المطاعم والمأكولات', 'چێشتخانە و نانخواردن', 4, FALSE),
  ('cafe', 'CAFES & COFFEE', 'المقاهي والقهوة', 'کافێ و قاوە', 3, FALSE),
  ('gym', 'GYM & FITNESS', 'الجيم واللياقة', 'هۆڵە وەرزشییەکان', 4, FALSE),
  ('hospitals', 'HOSPITALS & CLINICS', 'المستشفيات والعيادات', 'نەخۆشخانە و کلینیکەکان', 4, FALSE),
  ('shopping', 'SHOPPING & RETAIL', 'التسوق والتجزئة', 'بازاڕکردن و فرۆشتن', 3, FALSE),
  ('supermarkets', 'SUPERMARKETS', 'الأسواق المركزية', 'سوپەرمارکێتەکان', 4, FALSE),
  ('health', 'HEALTH & WELLNESS', 'الصحة والعافية', 'تەندروستی و باشژیانی', 5, FALSE),
  ('lawyers', 'LAWYERS & LEGAL', 'المحامون والقانون', 'پارێزەر و یاسا', 3, FALSE),
  ('pharmacy', 'PHARMACY & DRUGS', 'الصيدليات والأدوية', 'دەرمانخانە و دەرمان', 3, FALSE),
  ('banks', 'BANKS & FINANCE', 'البنوك والمالية', 'بانک و دارایی', 3, FALSE),
  ('education', 'EDUCATION', 'التعليم', 'پەروەردە', 3, FALSE),
  ('entertainment', 'ENTERTAINMENT', 'الترفيه', 'کات بەسەربردن', 3, FALSE),
  ('tourism', 'TOURISM & TRAVEL', 'السياحة والسفر', 'گەشتیاری و سەفەر', 3, FALSE),
  ('doctors', 'DOCTORS & PHYSICIANS', 'الأطباء والجراحون', 'دکتۆر و پزیشکەکان', 6, FALSE),
  ('realestate', 'REAL ESTATE', 'العقارات', 'خانووبەرە', 4, FALSE),
  ('events', 'EVENTS & VENUES', 'الفعاليات والقاعات', 'بۆنە و هۆڵەکان', 4, TRUE),
  ('beauty', 'BEAUTY & SALONS', 'الجمال والصالونات', 'جوانی و ساڵۆنەکان', 4, FALSE),
  ('furniture', 'FURNITURE & HOME', 'الأثاث والمنزل', 'کەلوپەلی ناوماڵ', 4, FALSE),
  ('general', 'SERVICES & OTHERS', 'الخدمات وأخرى', 'خزمەتگوزاری و ئەوانی تر', 4, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.governorates (id, name_en, name_ar, name_ku) VALUES
  ('baghdad', 'Baghdad', 'بغداد', 'بەغدا'),
  ('erbil', 'Erbil', 'أربيل', 'هەولێر'),
  ('basra', 'Basra', 'البصرة', 'بەصرە'),
  ('mosul', 'Mosul', 'الموصل', 'مووسڵ'),
  ('najaf', 'Najaf', 'النجف', 'نەجەف'),
  ('karbala', 'Karbala', 'كربلاء', 'کەربەلا'),
  ('sulaymaniyah', 'Sulaymaniyah', 'السليمانية', 'سلێمانی'),
  ('kirkuk', 'Kirkuk', 'كركوك', 'کەرکووک'),
  ('dohuk', 'Dohuk', 'دهوك', 'دهۆک'),
  ('anbar', 'Anbar', 'الأنبار', 'ئەنبار')
ON CONFLICT (id) DO NOTHING;

-- Insert sample cities for Baghdad
INSERT INTO public.cities (id, governorate_id, name_en, name_ar, name_ku) VALUES
  ('baghdad_center', 'baghdad', 'Baghdad Center', 'وسط بغداد', 'ناوەڕاستی بەغدا'),
  ('karrada', 'baghdad', 'Karrada', 'الكرادة', 'کەرادە'),
  ('mansour', 'baghdad', 'Mansour', 'المنصور', 'مەنسوور'),
  ('jadriya', 'baghdad', 'Al Jadriya', 'الجادرية', 'جەدریە'),
  ('zayouna', 'baghdad', 'Zayouna', 'الزاينبية', 'زەینەب')
ON CONFLICT (id) DO NOTHING;
