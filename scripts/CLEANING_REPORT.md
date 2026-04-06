# Root Cause Analysis

The original CSV upload failed due to multiple schema mismatches:

1. **Invalid column names**: CSV had "arabic_name", "business_name", "phone_1" but Supabase expects "nameAr", "name", "phone"
2. **Invalid category values**: CSV had "Shop/Retail", "Healthcare", "fuel" but Supabase only accepts specific frontend categories
3. **Invalid UUIDs**: CSV had string IDs like "iraq_businesses_local_2026-04-02.csv_1" instead of proper UUIDs
4. **Missing required fields**: Some rows lacked name, category, or phone
5. **Duplicate entries**: Same business name+phone appeared multiple times

# Solution Implementation

Created Node.js cleaning script that:
- Maps messy headers to exact Supabase schema
- Normalizes categories to frontend-approved values
- Generates proper UUIDs
- Validates required fields
- Removes duplicates
- Extracts governorate from address when missing

# Instructions to Run

1. Install dependencies:
   ```bash
   cd "C:\Users\HB LAPTOP STORE\Documents\GitHub\belive\scripts"
   npm install
   ```

2. Run cleaning script:
   ```bash
   node clean_final.js
   ```

3. Upload cleaned file:
   ```bash
   # Use existing upload script with cleaned CSV
   python upload_csv_to_supabase.py
   ```

# Expected Results

- **Input**: 4,312 raw rows
- **Output**: 1,479 clean, validated rows
- **Removed**: 244 invalid rows + 2,589 duplicates
- **Zero 400 errors** when uploading to Supabase
