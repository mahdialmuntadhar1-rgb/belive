#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const MASTER_HEADERS = [
  'ID','Business Name','Arabic Name','English Name','Category','Subcategory','Governorate','City','Neighborhood','Phone 1','Phone 2','WhatsApp','Email 1','Website','Facebook','Instagram','TikTok','Telegram','Opening Hours','Status','Rating','Verification','Confidence'
];

const SCAN_DIRS = [
  'data/import/raw',
  'data/import/samples',
  'scripts/legacy',
  'docs/import-notes',
];

const EXTENSIONS = new Set(['.csv', '.json', '.ndjson']);
const UNSUPPORTED_EXTENSIONS = new Set(['.xlsx', '.xls']);

const HEADER_MAP = new Map([
  // id
  ['id','ID'], ['business_id','ID'], ['listing_id','ID'], ['record_id','ID'],
  // names
  ['business_name','Business Name'], ['name','Business Name'], ['title','Business Name'], ['company_name','Business Name'], ['business','Business Name'],
  ['arabic_name','Arabic Name'], ['name_ar','Arabic Name'], ['business_name_ar','Arabic Name'], ['arabic','Arabic Name'],
  ['english_name','English Name'], ['name_en','English Name'], ['business_name_en','English Name'], ['english','English Name'],
  // taxonomy
  ['category','Category'], ['main_category','Category'],
  ['subcategory','Subcategory'], ['sub_category','Subcategory'], ['sub-category','Subcategory'],
  // geo
  ['governorate','Governorate'], ['province','Governorate'], ['state','Governorate'],
  ['city','City'], ['district','City'],
  ['neighborhood','Neighborhood'], ['neighbourhood','Neighborhood'], ['area','Neighborhood'],
  // phones
  ['phone','Phone 1'], ['phone1','Phone 1'], ['phone_1','Phone 1'], ['telephone','Phone 1'], ['mobile','Phone 1'],
  ['phone2','Phone 2'], ['phone_2','Phone 2'], ['alt_phone','Phone 2'], ['secondary_phone','Phone 2'],
  ['whatsapp','WhatsApp'], ['wa','WhatsApp'],
  // contact
  ['email','Email 1'], ['email1','Email 1'], ['email_1','Email 1'], ['mail','Email 1'],
  ['website','Website'], ['web','Website'], ['url','Website'],
  ['facebook','Facebook'], ['fb','Facebook'],
  ['instagram','Instagram'], ['ig','Instagram'],
  ['tiktok','TikTok'], ['tik_tok','TikTok'],
  ['telegram','Telegram'],
  // operations
  ['opening_hours','Opening Hours'], ['hours','Opening Hours'], ['work_hours','Opening Hours'],
  ['status','Status'], ['state_status','Status'],
  ['rating','Rating'], ['score','Rating'],
  ['verification','Verification'], ['verified','Verification'],
  ['confidence','Confidence'], ['confidence_score','Confidence'],
]);

function ensureDirs() {
  for (const d of SCAN_DIRS) fs.mkdirSync(d, { recursive: true });
  fs.mkdirSync('data/import/staged', { recursive: true });
  fs.mkdirSync('data/import/reports', { recursive: true });
}

function canonicalHeader(v) {
  return String(v || '')
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u200f\u200e]/g, '')
    .replace(/[()]/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '');
}

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && ch === ',') { row.push(cur); cur = ''; continue; }
    if (!inQuotes && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cur); cur = '';
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) rows.push(row);
      row = [];
      continue;
    }
    cur += ch;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  if (!rows.length) return { headers: [], records: [] };
  const headers = rows[0].map((h) => h.trim());
  const records = rows.slice(1).map((r) => {
    const rec = {};
    headers.forEach((h, idx) => { rec[h] = (r[idx] ?? '').trim(); });
    return rec;
  });
  return { headers, records };
}

function parseJSON(text) {
  const parsed = JSON.parse(text);
  const records = Array.isArray(parsed) ? parsed : [parsed];
  const headerSet = new Set();
  for (const r of records) Object.keys(r || {}).forEach((k) => headerSet.add(k));
  return { headers: [...headerSet], records };
}

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
function toAsciiDigits(s) {
  return s.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
}

function normalizePhone(raw) {
  const v = toAsciiDigits(String(raw || '').trim());
  if (!v) return '';
  const digits = v.replace(/[^\d+]/g, '');
  const onlyDigits = digits.replace(/\D/g, '');
  if (!onlyDigits) return '';
  if (onlyDigits.startsWith('964') && onlyDigits.length >= 12) return `+${onlyDigits}`;
  if (onlyDigits.startsWith('00964') && onlyDigits.length >= 14) return `+${onlyDigits.slice(2)}`;
  if (onlyDigits.startsWith('07') && onlyDigits.length === 11) return `+964${onlyDigits.slice(1)}`;
  if (onlyDigits.length === 10 && onlyDigits.startsWith('7')) return `+964${onlyDigits}`;
  if (v.startsWith('+')) return `+${onlyDigits}`;
  return onlyDigits;
}

function normalizeUrl(raw) {
  let v = String(raw || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v;
}

function normText(raw) {
  const v = String(raw ?? '').replace(/\s+/g, ' ').trim();
  return v === '' || /^null$/i.test(v) || /^n\/a$/i.test(v) ? '' : v;
}

function build() {
  ensureDirs();

  const discovered = SCAN_DIRS.flatMap((d) => listFiles(d));
  const supported = discovered.filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()));
  const unsupported = discovered.filter((f) => UNSUPPORTED_EXTENSIONS.has(path.extname(f).toLowerCase()));

  const stagedRows = [];
  const lineageRows = [];
  const report = {
    scanned_directories: SCAN_DIRS,
    discovered_files: discovered,
    unsupported_files: unsupported,
    source_headers: {},
    file_mappings: {},
    unmapped_columns: {},
    totals: {
      total_imported: 0,
      total_mapped: 0,
      total_missing_minimum_required_fields: 0,
    },
    generated_at: new Date().toISOString(),
  };

  let globalId = 1;
  for (const file of supported) {
    const ext = path.extname(file).toLowerCase();
    const text = fs.readFileSync(file, 'utf8');
    let parsed;
    try {
      if (ext === '.csv') parsed = parseCSV(text);
      else if (ext === '.json') parsed = parseJSON(text);
      else if (ext === '.ndjson') parsed = parseJSON(`[${text.split(/\r?\n/).filter(Boolean).join(',')}]`);
      else continue;
    } catch (e) {
      report.file_mappings[file] = { error: e.message };
      continue;
    }

    const headers = parsed.headers;
    report.source_headers[file] = headers;

    const mapping = {};
    const unmapped = [];
    for (const h of headers) {
      const master = HEADER_MAP.get(canonicalHeader(h));
      if (master) mapping[h] = master;
      else unmapped.push(h);
    }
    report.file_mappings[file] = mapping;
    report.unmapped_columns[file] = unmapped;

    const batch = path.basename(file).replace(path.extname(file), '');

    parsed.records.forEach((sourceRecord, idx) => {
      report.totals.total_imported += 1;
      const master = Object.fromEntries(MASTER_HEADERS.map((h) => [h, '']));

      for (const [rawHeader, value] of Object.entries(sourceRecord)) {
        const mappedHeader = mapping[rawHeader];
        if (!mappedHeader) continue;
        const clean = normText(value);
        if (!clean) continue;
        if (['Phone 1', 'Phone 2', 'WhatsApp'].includes(mappedHeader)) master[mappedHeader] = normalizePhone(clean);
        else if (['Website', 'Facebook', 'Instagram', 'TikTok', 'Telegram'].includes(mappedHeader)) master[mappedHeader] = normalizeUrl(clean);
        else if (['Governorate', 'City', 'Category', 'Subcategory', 'Neighborhood'].includes(mappedHeader)) master[mappedHeader] = normText(clean);
        else master[mappedHeader] = clean;
      }

      if (!master['ID']) master['ID'] = `stg-${globalId++}`;
      if (!master['Business Name']) {
        master['Business Name'] = normText(sourceRecord['Business Name'] || sourceRecord['name'] || sourceRecord['business_name'] || '');
      }

      const hasPhone = Boolean(master['Phone 1'] || master['Phone 2'] || master['WhatsApp']);
      const meetsMinimum = Boolean(master['Business Name'] && master['Governorate'] && hasPhone);
      if (!meetsMinimum) report.totals.total_missing_minimum_required_fields += 1;
      else report.totals.total_mapped += 1;

      stagedRows.push(master);
      lineageRows.push({
        id: master['ID'],
        source_file: file,
        import_batch: batch,
        original_row_id: sourceRecord.id || sourceRecord.ID || sourceRecord.row_id || sourceRecord.rowId || idx + 2,
        source_row_number: idx + 2,
        meets_minimum_required_fields: meetsMinimum,
        raw_source_record_json: JSON.stringify(sourceRecord),
      });
    });
  }

  const csvEscape = (v) => {
    const s = String(v ?? '');
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const stagedCsv = [MASTER_HEADERS.join(',')]
    .concat(stagedRows.map((r) => MASTER_HEADERS.map((h) => csvEscape(r[h])).join(',')))
    .join('\n');

  const lineageHeaders = ['id','source_file','import_batch','original_row_id','source_row_number','meets_minimum_required_fields','raw_source_record_json'];
  const lineageCsv = [lineageHeaders.join(',')]
    .concat(lineageRows.map((r) => lineageHeaders.map((h) => csvEscape(r[h])).join(',')))
    .join('\n');

  fs.writeFileSync('data/import/staged/master_table_staged.csv', stagedCsv);
  fs.writeFileSync('data/import/staged/master_table_lineage.csv', lineageCsv);
  fs.writeFileSync('data/import/reports/master_table_mapping_report.json', JSON.stringify(report, null, 2));

  console.log(JSON.stringify({
    staged_dataset: 'data/import/staged/master_table_staged.csv',
    lineage_dataset: 'data/import/staged/master_table_lineage.csv',
    report: 'data/import/reports/master_table_mapping_report.json',
    totals: report.totals,
    supported_files: supported.length,
    unsupported_files: unsupported,
  }, null, 2));
}

build();
