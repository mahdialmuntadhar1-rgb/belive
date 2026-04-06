#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const TARGET_COLUMNS = [
  'id',
  'name',
  'nameAr',
  'nameKu',
  'category',
  'subcategory',
  'governorate',
  'city',
  'address',
  'phone',
  'whatsapp',
  'website',
  'description',
  'descriptionAr',
  'descriptionKu',
  'image_url',
  'coverimage',
  'openHours',
  'pricerange',
  'tags',
  'lat',
  'lng',
  'rating',
  'verified',
  'status',
  'source_name',
  'external_source_id',
  'confidence_score',
  'created_by_agent'
];

const NULLISH_VALUES = new Set(['', 'unknown', 'n/a', 'na', 'null', 'undefined', '-', '--']);

const HEADER_MAP = {
  // core
  name: 'name',
  'business name': 'name',
  business_name: 'name',
  businessname: 'name',
  arabicname: 'nameAr',
  'arabic name': 'nameAr',
  arabic_name: 'nameAr',
  namear: 'nameAr',
  kurdishname: 'nameKu',
  'kurdish name': 'nameKu',
  kurdish_name: 'nameKu',
  nameku: 'nameKu',

  // taxonomy
  category: 'category',
  subcategory: 'subcategory',

  // location
  governorate: 'governorate',
  city: 'city',
  address: 'address',

  // contacts
  phone: 'phone',
  'phone 1': 'phone',
  phone_1: 'phone',
  whatsapp: 'whatsapp',
  website: 'website',

  // content
  description: 'description',
  descriptionar: 'descriptionAr',
  descriptionku: 'descriptionKu',
  'description ar': 'descriptionAr',
  'description ku': 'descriptionKu',

  // media
  image: 'image_url',
  'image url': 'image_url',
  imageurl: 'image_url',
  image_url: 'image_url',
  coverimage: 'coverimage',

  // ops
  'opening hours': 'openHours',
  openinghours: 'openHours',
  openhours: 'openHours',
  pricerange: 'pricerange',
  'price range': 'pricerange'
};

const DIRECT_COLUMNS = new Set(TARGET_COLUMNS.map((col) => col.toLowerCase()));

const CATEGORY_RULES = [
  { patterns: [/restaurant/i, /food/i, /مطعم/i], value: 'dining' },
  { patterns: [/coffee/i, /cafe/i, /قهوة/i], value: 'cafe' },
  { patterns: [/hotel/i], value: 'hotels' },
  { patterns: [/shop/i, /store/i], value: 'shopping' }
];

const ALLOWED_CATEGORIES = new Set([
  'dining',
  'cafe',
  'hotels',
  'shopping',
  'banks',
  'education',
  'entertainment',
  'tourism',
  'doctors',
  'lawyers',
  'hospitals',
  'medical',
  'realestate',
  'events',
  'pharmacy',
  'gym',
  'beauty',
  'supermarkets',
  'general'
]);

const GOVERNORATE_MAP = {
  baghdad: 'baghdad',
  erbil: 'erbil',
  hawler: 'erbil',
  basra: 'basra',
  sulaymaniyah: 'sulaymaniyah',
  sulaymaniya: 'sulaymaniyah',
  slemani: 'sulaymaniyah',
  duhok: 'duhok',
  dohuk: 'duhok',
  najaf: 'najaf',
  karbala: 'karbala',
  kirkuk: 'kirkuk',
  nineveh: 'nineveh',
  ninawa: 'nineveh',
  anbar: 'anbar',
  babel: 'babel',
  babylon: 'babel',
  diyala: 'diyala',
  dhiqar: 'dhiqar',
  'dhi qar': 'dhiqar',
  maysan: 'maysan',
  wasit: 'wasit',
  salahaddin: 'salahaddin',
  'salah ad din': 'salahaddin',
  muqdadiya: 'diyala'
};

function normalizeHeader(header) {
  const original = String(header || '').trim();
  const lower = original.toLowerCase();
  const compact = lower.replace(/\s+/g, ' ').trim();
  const snake = compact.replace(/\s+/g, '_');
  return { original, lower: compact, snake };
}

function mapHeader(rawHeader) {
  const { lower, snake } = normalizeHeader(rawHeader);
  if (HEADER_MAP[lower]) return HEADER_MAP[lower];
  if (HEADER_MAP[snake]) return HEADER_MAP[snake];
  if (DIRECT_COLUMNS.has(lower)) {
    const exact = TARGET_COLUMNS.find((c) => c.toLowerCase() === lower);
    return exact || null;
  }
  return null;
}

function cleanString(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (NULLISH_VALUES.has(str.toLowerCase())) return null;
  return str;
}

function normalizeCategory(raw) {
  const cleaned = cleanString(raw);
  if (!cleaned) return null;

  const lowered = cleaned.toLowerCase().replace(/\s+/g, '');
  if (ALLOWED_CATEGORIES.has(lowered)) return lowered;

  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(cleaned))) return rule.value;
  }

  return 'general';
}

function normalizeGovernorate(raw) {
  const cleaned = cleanString(raw);
  if (!cleaned) return null;
  const lowered = cleaned.toLowerCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
  const key = lowered.replace(/\s+/g, '');
  return GOVERNORATE_MAP[key] || GOVERNORATE_MAP[lowered] || key;
}

function normalizePhone(raw) {
  const cleaned = cleanString(raw);
  if (!cleaned) return null;

  const plus = cleaned.startsWith('+');
  let digits = cleaned.replace(/[^\d]/g, '');
  if (!digits) return null;

  if (digits.startsWith('964')) return `+${digits}`;
  if (digits.startsWith('0') && digits.length >= 10) return `+964${digits.slice(1)}`;
  if (!plus && digits.length === 10 && digits.startsWith('7')) return `+964${digits}`;

  return plus ? `+${digits}` : digits;
}

function normalizeBoolean(raw) {
  const cleaned = cleanString(raw);
  if (cleaned === null) return null;
  const value = cleaned.toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(value)) return 'true';
  if (['false', '0', 'no', 'n'].includes(value)) return 'false';
  return null;
}

function normalizeNumeric(raw) {
  const cleaned = cleanString(raw);
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? String(n) : null;
}

function parseCsv(content) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    const next = content[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(current);
      current = '';
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    current += ch;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }

  if (rows.length === 0) return [];

  const headers = rows[0];
  return rows.slice(1).map((values) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? '';
    });
    return obj;
  });
}

async function readRows(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.csv') {
    const content = fs.readFileSync(inputPath, 'utf8');
    return parseCsv(content);
  }

  if (ext === '.xlsx' || ext === '.xls') {
    let xlsx;
    try {
      xlsx = await import('xlsx');
    } catch {
      throw new Error('Excel input requires dependency "xlsx". Install with: npm i xlsx');
    }

    const workbook = xlsx.readFile(inputPath);
    const firstSheet = workbook.SheetNames[0];
    const json = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });
    return json;
  }

  throw new Error('Unsupported input type. Use .csv, .xlsx, or .xls');
}

function csvEscape(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows) {
  const lines = [TARGET_COLUMNS.join(',')];
  for (const row of rows) {
    lines.push(TARGET_COLUMNS.map((col) => csvEscape(row[col])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function cleanRow(rawRow) {
  const row = Object.fromEntries(TARGET_COLUMNS.map((col) => [col, '']));

  for (const [key, value] of Object.entries(rawRow)) {
    const mapped = mapHeader(key);
    if (!mapped) continue;
    const cleaned = cleanString(value);
    if (cleaned === null) continue;
    row[mapped] = cleaned;
  }

  row.name = cleanString(row.name) || '';
  row.category = normalizeCategory(row.category) || '';
  row.governorate = normalizeGovernorate(row.governorate) || '';
  row.phone = normalizePhone(row.phone) || '';
  row.whatsapp = normalizePhone(row.whatsapp) || '';

  row.lat = normalizeNumeric(row.lat) || '';
  row.lng = normalizeNumeric(row.lng) || '';
  row.rating = normalizeNumeric(row.rating) || '';
  row.confidence_score = normalizeNumeric(row.confidence_score) || '';

  const verified = normalizeBoolean(row.verified);
  row.verified = verified ?? '';

  row.status = cleanString(row.status) || '';

  if (!row.name || !row.category) return null;
  return row;
}

async function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3] || 'clean_businesses.csv';

  if (!inputPath) {
    console.error('Usage: node scripts/standardize-businesses.mjs <input.csv|input.xlsx> [output.csv]');
    process.exit(1);
  }

  const rows = await readRows(inputPath);

  let removedMissing = 0;
  let duplicatesRemoved = 0;
  let cleanedCount = 0;
  const dedupe = new Set();
  const cleanedRows = [];

  for (const raw of rows) {
    const cleaned = cleanRow(raw);
    if (!cleaned) {
      removedMissing += 1;
      continue;
    }

    const dedupeKey = `${cleaned.name.toLowerCase()}::${cleaned.phone}`;
    if (dedupe.has(dedupeKey)) {
      duplicatesRemoved += 1;
      continue;
    }

    dedupe.add(dedupeKey);
    cleanedRows.push(cleaned);
    cleanedCount += 1;
  }

  fs.writeFileSync(outputPath, toCsv(cleanedRows), 'utf8');

  const totalRowsProcessed = rows.length;
  const rowsRemoved = removedMissing + duplicatesRemoved;

  console.log('=== Cleaning Summary ===');
  console.log(`total rows processed: ${totalRowsProcessed}`);
  console.log(`rows removed: ${rowsRemoved}`);
  console.log(`rows cleaned: ${cleanedCount}`);
  console.log(`duplicates removed: ${duplicatesRemoved}`);
  console.log('');
  console.log('=== 3 Cleaned Row Samples ===');
  cleanedRows.slice(0, 3).forEach((row, idx) => {
    console.log(`${idx + 1}. ${JSON.stringify(row)}`);
  });
  console.log(`\nOutput written: ${outputPath}`);
}

main().catch((err) => {
  console.error('Failed to clean file:', err.message);
  process.exit(1);
});
