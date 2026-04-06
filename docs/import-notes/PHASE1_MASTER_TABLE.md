# Phase 1 — Master Table Staging

This pipeline standardizes imported business files into one staged master table with the approved columns in exact order:

1. ID
2. Business Name
3. Arabic Name
4. English Name
5. Category
6. Subcategory
7. Governorate
8. City
9. Neighborhood
10. Phone 1
11. Phone 2
12. WhatsApp
13. Email 1
14. Website
15. Facebook
16. Instagram
17. TikTok
18. Telegram
19. Opening Hours
20. Status
21. Rating
22. Verification
23. Confidence

## Run

```bash
node scripts/build-master-table.js
```

## Outputs

- `data/import/staged/master_table_staged.csv` (exact approved headers)
- `data/import/staged/master_table_lineage.csv` (source file + import batch + row lineage)
- `data/import/reports/master_table_mapping_report.json` (discovered files, headers, per-file mappings, unmapped columns, row counts)

## Normalization in this phase

- Whitespace trimming
- Empty/null unification
- Safe Iraqi phone normalization (`+964...` when detectable)
- Basic URL normalization (prepend `https://` when scheme missing)
- Spacing cleanup for governorate/city/category/subcategory/neighborhood

No online validation, dedupe, or production sync is performed in this phase.
