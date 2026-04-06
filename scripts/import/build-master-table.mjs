#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGET_DIRS = [
  'data/import/raw',
  'data/import/samples',
  'scripts/legacy',
  'docs/import-notes',
];

const MASTER_HEADERS = [
  'ID',
  'Business Name',
  'Arabic Name',
  'English Name',
  'Category',
  'Subcategory',
  'Governorate',
  'City',
  'Neighborhood',
  'Phone 1',
  'Phone 2',
  'WhatsApp',
  'Email 1',
  'Website',
  'Facebook',
  'Instagram',
  'TikTok',
  'Telegram',
  'Opening Hours',
  'Status',
  'Rating',
  'Verification',
  'Confidence',
];

const SUPPORTED_EXT = new Set(['.csv', '.tsv', '.json', '.jsonl', '.xlsx', '.xls']);

const HEADER_MAP = new Map([
  ['id', 'ID'],
  ['businessname', 'Business Name'],
  ['name', 'Business Name'],
  ['companyname', 'Business Name'],
  ['business', 'Business Name'],
  ['tradename', 'Business Name'],

  ['arabicname', 'Arabic Name'],
  ['namear', 'Arabic Name'],
  ['arabic', 'Arabic Name'],
  ['kurdishname', 'Arabic Name'],
  ['nameku', 'Arabic Name'],

  ['englishname', 'English Name'],
  ['nameen', 'English Name'],

  ['category', 'Category'],
  ['type', 'Category'],
  ['subcategory', 'Subcategory'],
  ['subcat', 'Subcategory'],

  ['governorate', 'Governorate'],
  ['governate', 'Governorate'],
  ['province', 'Governorate'],
  ['muhafaza', 'Governorate'],

  ['city', 'City'],
  ['district', 'City'],
  ['neighborhood', 'Neighborhood'],
  ['neighbourhood', 'Neighborhood'],
  ['area', 'Neighborhood'],

  ['phone', 'Phone 1'],
  ['phone1', 'Phone 1'],
  ['mobile', 'Phone 1'],
  ['telephone', 'Phone 1'],
  ['phone2', 'Phone 2'],
  ['secondaryphone', 'Phone 2'],
  ['whatsapp', 'WhatsApp'],
  ['whatsappnumber', 'WhatsApp'],

  ['email', 'Email 1'],
  ['email1', 'Email 1'],
  ['website', 'Website'],
  ['web', 'Website'],

  ['facebook', 'Facebook'],
  ['facebookurl', 'Facebook'],
  ['instagram', 'Instagram'],
  ['instagramurl', 'Instagram'],
  ['tiktok', 'TikTok'],
  ['telegram', 'Telegram'],

  ['openinghours', 'Opening Hours'],
  ['hours', 'Opening Hours'],

  ['status', 'Status'],
  ['rating', 'Rating'],
  ['verification', 'Verification'],
  ['verified', 'Verification'],
  ['confidence', 'Confidence'],
]);

function listFilesInDir(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(current, e.name);
      if (e.isDirectory()) {
        stack.push(full);
      } else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        if (SUPPORTED_EXT.has(ext)) {
          out.push(path.relative(ROOT, full));
        }
      }
    }
  }
  return out.sort();
}

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\u200f\u200e]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function mapHeader(rawHeader) {
  const key = normalizeHeader(rawHeader);
  return HEADER_MAP.get(key) || null;
}

function parseCsvLike(content, delimiter = ',') {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell);
      cell = '';
      if (row.some((v) => String(v).trim() !== '')) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }

  if (cell !== '' || row.length) {
    row.push(cell);
    if (row.some((v) => String(v).trim() !== '')) rows.push(row);
  }

  return rows;
}

function parseJsonContent(content) {
  const parsed = JSON.parse(content);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.data)) return parsed.data;
  return [];
}

function parseJsonlContent(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function convertArabicDigits(input) {
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  const easternArabicIndic = '۰۱۲۳۴۵۶۷۸۹';
  return String(input || '')
    .split('')
    .map((ch) => {
      const i1 = arabicIndic.indexOf(ch);
      if (i1 >= 0) return String(i1);
      const i2 = easternArabicIndic.indexOf(ch);
      if (i2 >= 0) return String(i2);
      return ch;
    })
    .join('');
}

function normalizePhone(input) {
  const raw = convertArabicDigits(input).trim();
  if (!raw) return '';

  let digits = raw.replace(/\D+/g, '');
  if (!digits) return '';

  if (digits.startsWith('00964') && digits.length >= 14) {
    digits = `0${digits.slice(5)}`;
  } else if (digits.startsWith('964') && digits.length >= 13) {
    digits = `0${digits.slice(3)}`;
  } else if (digits.length === 10 && digits.startsWith('7')) {
    digits = `0${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('07')) return digits;
  return digits;
}

function normalizeUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) return `https://${raw}`;
  return raw;
}

function normalizeSimpleText(input) {
  return String(input || '').trim().replace(/\s+/g, ' ');
}

function normalizeValueByHeader(header, value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || /^null$/i.test(trimmed) || /^n\/?a$/i.test(trimmed)) return '';

  if (['Phone 1', 'Phone 2', 'WhatsApp'].includes(header)) return normalizePhone(trimmed);
  if (['Website', 'Facebook', 'Instagram', 'TikTok', 'Telegram'].includes(header)) return normalizeUrl(trimmed);
  if (['Governorate', 'City', 'Category', 'Subcategory', 'Neighborhood'].includes(header)) return normalizeSimpleText(trimmed);
  return trimmed;
}

async function toRowsAndHeaders(filePath) {
  const abs = path.join(ROOT, filePath);
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(abs);

  if (ext === '.csv' || ext === '.tsv') {
    const text = content.toString('utf8');
    const rows = parseCsvLike(text, ext === '.tsv' ? '\t' : ',');
    if (!rows.length) return { headers: [], rows: [] };
    const [headers, ...rest] = rows;
    return {
      headers: headers.map((h) => String(h ?? '')),
      rows: rest.map((r) => Object.fromEntries(headers.map((h, i) => [String(h ?? ''), r[i] ?? '']))),
    };
  }

  if (ext === '.json') {
    const data = parseJsonContent(content.toString('utf8'));
    const headers = [...new Set(data.flatMap((item) => Object.keys(item || {})))];
    return { headers, rows: data };
  }

  if (ext === '.jsonl') {
    const data = parseJsonlContent(content.toString('utf8'));
    const headers = [...new Set(data.flatMap((item) => Object.keys(item || {})))];
    return { headers, rows: data };
  }

  if (ext === '.xlsx' || ext === '.xls') {
    let xlsx;
    try {
      xlsx = await import('xlsx');
    } catch {
      throw new Error('XLSX dependency is not installed (package: xlsx)');
    }
    const wb = xlsx.read(content, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(ws, { defval: '' });
    const headers = [...new Set(json.flatMap((item) => Object.keys(item || {})))];
    return { headers, rows: json };
  }

  return { headers: [], rows: [] };
}

function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

async function run() {
  const batchId = `batch_${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const discoveredFiles = TARGET_DIRS.flatMap((d) => listFilesInDir(d));

  const report = {
    batchId,
    inspectedDirectories: TARGET_DIRS,
    inspectedFiles: discoveredFiles,
    sourceHeadersByFile: {},
    headerMappingByFile: {},
    unmappedSourceColumnsByFile: {},
    unsupportedFiles: {},
    rowCounts: {
      totalImported: 0,
      totalMapped: 0,
      totalMissingMinimumRequiredFields: 0,
    },
  };

  const masterRows = [];
  const trackingRows = [];

  for (const file of discoveredFiles) {
    try {
      const { headers, rows } = await toRowsAndHeaders(file);
      report.sourceHeadersByFile[file] = headers;

      const mapping = {};
      const unmapped = [];
      for (const h of headers) {
        const mapped = mapHeader(h);
        if (mapped) mapping[h] = mapped;
        else unmapped.push(h);
      }
      report.headerMappingByFile[file] = mapping;
      report.unmappedSourceColumnsByFile[file] = unmapped;

      rows.forEach((rawRow, idx) => {
        report.rowCounts.totalImported += 1;

        const output = Object.fromEntries(MASTER_HEADERS.map((h) => [h, '']));
        let hasUncertainArabic = false;

        for (const sourceHeader of headers) {
          const target = mapping[sourceHeader];
          if (!target) continue;

          const rawVal = rawRow?.[sourceHeader];
          let normalized = normalizeValueByHeader(target, rawVal);

          if (target === 'Arabic Name' && /�/.test(String(rawVal ?? ''))) {
            hasUncertainArabic = true;
            normalized = String(rawVal ?? '').trim();
          }

          if (!output[target]) output[target] = normalized;
        }

        if (!output['Business Name']) {
          output['Business Name'] = output['English Name'] || output['Arabic Name'] || '';
        }

        if (!output['Confidence']) {
          output['Confidence'] = hasUncertainArabic ? 'low' : 'high';
        }

        const sourceRowId = headers.find((h) => normalizeHeader(h) === 'id') ? rawRow?.[headers.find((h) => normalizeHeader(h) === 'id')] : '';

        const hasMinimum = Boolean(
          output['Business Name'] &&
          output['Governorate'] &&
          (output['Phone 1'] || output['Phone 2'] || output['WhatsApp'])
        );

        if (!hasMinimum) report.rowCounts.totalMissingMinimumRequiredFields += 1;
        else report.rowCounts.totalMapped += 1;

        masterRows.push(output);
        trackingRows.push({
          master_row_number: masterRows.length,
          source_file: file,
          import_batch_id: batchId,
          source_row_id: sourceRowId || String(idx + 2),
          has_minimum_required_fields: hasMinimum ? 'true' : 'false',
        });
      });
    } catch (err) {
      report.unsupportedFiles[file] = String(err.message || err);
    }
  }

  const outputDir = path.join(ROOT, 'data/master');
  fs.mkdirSync(outputDir, { recursive: true });

  const masterCsv = [
    MASTER_HEADERS.map(escapeCsv).join(','),
    ...masterRows.map((r) => MASTER_HEADERS.map((h) => escapeCsv(r[h])).join(',')),
  ].join('\n');

  const trackingHeaders = [
    'master_row_number',
    'source_file',
    'import_batch_id',
    'source_row_id',
    'has_minimum_required_fields',
  ];

  const trackingCsv = [
    trackingHeaders.join(','),
    ...trackingRows.map((r) => trackingHeaders.map((h) => escapeCsv(r[h])).join(',')),
  ].join('\n');

  fs.writeFileSync(path.join(outputDir, 'staged_master_table.csv'), masterCsv);
  fs.writeFileSync(path.join(outputDir, 'staged_master_tracking.csv'), trackingCsv);
  fs.writeFileSync(path.join(outputDir, 'master_mapping_report.json'), JSON.stringify(report, null, 2));

  console.log(JSON.stringify({
    batchId,
    inspectedFileCount: discoveredFiles.length,
    stagedRows: masterRows.length,
    ...report.rowCounts,
  }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
