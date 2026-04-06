const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

// CONFIGURATION
const INPUT_FILE = "C:\\Users\\HB LAPTOP STORE\\Documents\\FOR-CLEANING-ALL\\analysis_output\\with_valid_phone.csv";
const OUTPUT_FILE = 'clean_businesses.csv';

// TARGET SCHEMA - ONLY THESE COLUMNS ALLOWED
const ALLOWED_COLUMNS = [
  'id', 'name', 'nameAr', 'nameKu', 'category', 'subcategory',
  'governorate', 'city', 'address', 'phone', 'whatsapp', 'website',
  'description', 'descriptionAr', 'descriptionKu', 'image_url',
  'coverimage', 'openHours', 'pricerange', 'tags', 'lat', 'lng',
  'rating', 'verified', 'status', 'source_name', 'external_source_id',
  'confidence_score', 'created_by_agent'
];

// HEADER MAPPING
const HEADER_MAP = {
  'Business Name': 'name',
  'business_name': 'name',
  'Name': 'name',
  'Arabic Name': 'nameAr',
  'arabic_name': 'nameAr',
  'Kurdish Name': 'nameKu',
  'kurdish_name': 'nameKu',
  'Category': 'category',
  'category': 'category',
  'Subcategory': 'subcategory',
  'subcategory': 'subcategory',
  'Governorate': 'governorate',
  'governorate': 'governorate',
  'City': 'city',
  'city': 'city',
  'Address': 'address',
  'address': 'address',
  'Neighborhood': 'address',
  'neighborhood': 'address',
  'Phone 1': 'phone',
  'Phone': 'phone',
  'phone_1': 'phone',
  'WhatsApp': 'whatsapp',
  'whatsapp': 'whatsapp',
  'Website': 'website',
  'website': 'website',
  'Description': 'description',
  'description': 'description',
  'Image': 'image_url',
  'Image URL': 'image_url',
  'Opening Hours': 'openHours',
  'opening_hours': 'openHours',
  'Price Range': 'pricerange',
  'price_range': 'pricerange',
  'Status': 'status',
  'status': 'status',
  'Verification': 'verification_status',
  'verification': 'verification_status',
  'Confidence': 'confidence_score',
  'confidence': 'confidence_score',
  '_source_file': 'source_name'
};

// CATEGORY NORMALIZATION
const CATEGORY_MAP = {
  'restaurant': 'dining',
  'food': 'dining',
  'مطعم': 'dining',
  'cafe': 'cafe',
  'coffee': 'cafe',
  'قهوة': 'cafe',
  'hotel': 'hotels',
  'shop': 'shopping',
  'store': 'shopping',
  'shopping': 'shopping',
  'supermarket': 'supermarkets',
  'supermarket': 'supermarkets',
  'bank': 'banks',
  'school': 'education',
  'education': 'education',
  'university': 'education',
  'hospital': 'hospitals',
  'clinic': 'medical',
  'medical': 'medical',
  'pharmacy': 'pharmacy',
  'gym': 'gym',
  'beauty': 'beauty',
  'salon': 'beauty',
  'entertainment': 'entertainment',
  'cinema': 'entertainment',
  'tourism': 'tourism',
  'travel': 'tourism',
  'real': 'realestate',
  'property': 'realestate',
  'lawyer': 'lawyers',
  'lawyers': 'lawyers',
  'event': 'events',
  'events': 'events',
  'fuel': 'general',
  'furniture': 'general',
  'clothes': 'general',
  'electronics': 'general'
};

// GOVERNORATE NORMALIZATION
const GOVERNORATE_MAP = {
  'baghdad': 'baghdad',
  'erbil': 'erbil',
  'basra': 'basra',
  'sulaymaniyah': 'sulaymaniyah',
  'mosul': 'mosul',
  'duhok': 'duhok',
  'kirkuk': 'kirkuk',
  'najaf': 'najaf',
  'karbala': 'karbala',
  'wasit': 'wasit',
  'maysan': 'maysan',
  'dhi qar': 'dhi qar',
  'muthanna': 'muthanna',
  'al-anbar': 'al-anbar',
  'babil': 'babil',
  'diwaniyah': 'diwaniyah',
  'samarra': 'samarra',
  'taqtaq': 'taqtaq',
  'kifl': 'kifl',
  'muthana': 'muthana',
  'salah ad din': 'salah ad din',
  'halabja': 'halabja',
  'kurdistan': 'kurdistan',
  'qadisiyyah': 'qadisiyyah',
  'krmat ali': 'dhi qar',
  'pirde': 'erbil'
};

// UTILITIES
function cleanValue(value) {
  if (!value || typeof value !== 'string') return null;
  const cleaned = value.trim();
  if (['', 'unknown', 'n/a', 'na', 'null', 'undefined', '-', '--'].includes(cleaned.toLowerCase())) {
    return null;
  }
  return cleaned;
}

function normalizePhone(phone) {
  if (!phone) return null;
  const cleaned = phone.toString().replace(/[^\d]/g, '');
  if (!cleaned || cleaned.length < 7) return null;
  
  // Iraqi numbers: convert 07XXXXXXXX to +9647XXXXXXXX
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '+964' + cleaned.substring(1);
  }
  if (cleaned.startsWith('964') && !cleaned.startsWith('+964')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('+964')) {
    return cleaned;
  }
  if (cleaned.length === 10 && cleaned.startsWith('7')) {
    return '+964' + cleaned;
  }
  return cleaned;
}

function normalizeCategory(category) {
  if (!category) return 'general';
  const normalized = category.toLowerCase().trim();
  return CATEGORY_MAP[normalized] || 'general';
}

function normalizeGovernorate(gov) {
  if (!gov) return null;
  const normalized = gov.toLowerCase().trim();
  return GOVERNORATE_MAP[normalized] || normalized;
}

// MAIN PROCESSING
async function processCSV() {
  console.log('🔄 Processing CSV file...');
  
  const results = [];
  let totalRows = 0;
  let removedRows = 0;
  let duplicateRows = 0;
  const seenBusinesses = new Set();
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(INPUT_FILE)
      .pipe(csv())
      .on('data', (row) => {
        totalRows++;
        
        // Transform row
        const transformed = {};
        
        // Map headers
        for (const [csvHeader, value] of Object.entries(row)) {
          const cleanHeader = csvHeader.trim();
          const targetColumn = HEADER_MAP[cleanHeader];
          
          if (targetColumn && ALLOWED_COLUMNS.includes(targetColumn)) {
            transformed[targetColumn] = cleanValue(value);
          }
        }
        
        // Apply transformations
        if (transformed.phone) {
          transformed.phone = normalizePhone(transformed.phone);
        }
        
        if (transformed.category) {
          transformed.category = normalizeCategory(transformed.category);
        }
        
        if (transformed.governorate) {
          transformed.governorate = normalizeGovernorate(transformed.governorate);
        }
        
        // Extract location from address if missing
        if (!transformed.governorate && transformed.address) {
          const parts = transformed.address.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            const potentialGov = parts[parts.length - 1];
            const normalizedGov = normalizeGovernorate(potentialGov);
            if (normalizedGov) {
              transformed.governorate = normalizedGov;
            }
          }
        }
        
        // Set defaults
        transformed.id = uuidv4();
        transformed.status = 'approved';
        transformed.confidence_score = 0.5;
        transformed.source_name = 'csv_import';
        
        // Validation - remove invalid rows
        if (!transformed.name || !transformed.category || !transformed.phone) {
          removedRows++;
          return;
        }
        
        // Remove duplicates
        const duplicateKey = `${transformed.name}_${transformed.phone}`;
        if (seenBusinesses.has(duplicateKey)) {
          duplicateRows++;
          return;
        }
        seenBusinesses.add(duplicateKey);
        
        // Filter to only allowed columns
        const filteredRow = {};
        for (const col of ALLOWED_COLUMNS) {
          if (transformed[col] !== undefined) {
            filteredRow[col] = transformed[col];
          }
        }
        
        results.push(filteredRow);
      })
      .on('end', () => {
        // Write cleaned CSV
        if (results.length === 0) {
          console.log('❌ No valid data to export');
          return;
        }
        
        const csvHeader = ALLOWED_COLUMNS.join(',');
        const csvRows = results.map(row => {
          return ALLOWED_COLUMNS.map(col => {
            const value = row[col] || '';
            return `"${value.toString().replace(/"/g, '""')}"`;
          }).join(',');
        });
        
        const csvContent = csvHeader + '\n' + csvRows.join('\n');
        fs.writeFileSync(OUTPUT_FILE, csvContent);
        
        // Summary
        console.log('\n✅ PROCESSING COMPLETE');
        console.log('='.repeat(50));
        console.log(`📊 Total rows processed: ${totalRows}`);
        console.log(`🗑️  Rows removed (invalid): ${removedRows}`);
        console.log(`🔄 Duplicates removed: ${duplicateRows}`);
        console.log(`✅ Final clean rows: ${results.length}`);
        console.log(`📁 Output file: ${OUTPUT_FILE}`);
        
        // Example rows
        console.log('\n📝 Example cleaned rows:');
        for (let i = 0; i < Math.min(3, results.length); i++) {
          console.log(`Row ${i + 1}:`);
          console.log(`  name: ${results[i].name}`);
          console.log(`  category: ${results[i].category}`);
          console.log(`  phone: ${results[i].phone}`);
          console.log(`  governorate: ${results[i].governorate}`);
          console.log(`  city: ${results[i].city}`);
          console.log('');
        }
        
        resolve();
      })
      .on('error', reject);
  });
}

// RUN
if (require.main === module) {
  processCSV().catch(console.error);
}

module.exports = { processCSV };
