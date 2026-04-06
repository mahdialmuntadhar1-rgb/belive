-- Phase 4: Add Halabja (Iraq's 18th governorate, created 2014)
-- No businesses currently use this governorate but it is officially part of Iraq.
INSERT INTO governorates (name_en, name_ar, name_ku)
VALUES ('Halabja', 'حلبجة', 'هەڵەبجە')
ON CONFLICT (name_en) DO NOTHING;
