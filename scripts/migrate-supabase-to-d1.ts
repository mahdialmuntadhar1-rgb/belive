/**
 * Migration Script: Supabase to Cloudflare D1
 * 
 * This script exports data from Supabase and generates SQL for D1 import.
 * 
 * Prerequisites:
 * - Node.js installed
 * - Supabase project with read access
 * - Supabase credentials in .env (SUPABASE_URL, SUPABASE_ANON_KEY)
 * 
 * Usage:
 *   npm install @supabase/supabase-js dotenv
 *   npx tsx scripts/migrate-supabase-to-d1.ts
 * 
 * After generating the SQL file:
 *   wrangler d1 execute belive-db --file=migration-output.sql --remote
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Table definitions in order (respecting foreign key dependencies)
const TABLES = [
  'users',
  'governorates',
  'cities',
  'categories',
  'features',
  'hero_slides',
  'businesses',
  'posts',
  'post_comments',
  'reviews',
  'claim_requests',
  'password_resets',
];

// PostgreSQL to SQLite type conversions
function convertValue(value: any): string {
  if (value === null) return 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    // Escape single quotes
    const escaped = value.replace(/'/g, "''");
    return `'${escaped}'`;
  }
  if (value instanceof Date) {
    // Convert to Unix timestamp (milliseconds)
    return String(value.getTime());
  }
  if (typeof value === 'object') {
    // JSON objects -> store as JSON string
    const escaped = JSON.stringify(value).replace(/'/g, "''");
    return `'${escaped}'`;
  }
  return 'NULL';
}

function generateInsert(tableName: string, columns: string[], rows: any[]): string {
  if (rows.length === 0) {
    return `-- No data for table ${tableName}\n`;
  }

  const columnList = columns.join(', ');
  const statements: string[] = [];

  for (const row of rows) {
    const values = columns.map(col => convertValue(row[col])).join(', ');
    statements.push(`INSERT INTO ${tableName} (${columnList}) VALUES (${values});`);
  }

  return statements.join('\n') + '\n';
}

async function exportTable(tableName: string): Promise<{ columns: string[]; rows: any[] }> {
  console.log(`Exporting ${tableName}...`);
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*');
  
  if (error) {
    console.error(`Error exporting ${tableName}:`, error.message);
    return { columns: [], rows: [] };
  }

  if (!data || data.length === 0) {
    console.log(`  No data found for ${tableName}`);
    return { columns: [], rows: [] };
  }

  const columns = Object.keys(data[0]);
  console.log(`  Exported ${data.length} rows`);
  
  return { columns, rows: data };
}

async function main() {
  console.log('Starting Supabase to D1 migration...\n');
  
  const outputLines: string[] = [];
  outputLines.push('-- Migration from Supabase to D1');
  outputLines.push(`-- Generated: ${new Date().toISOString()}`);
  outputLines.push('--');
  outputLines.push('-- Usage: wrangler d1 execute belive-db --file=migration-output.sql --remote');
  outputLines.push('--');
  outputLines.push('');

  for (const tableName of TABLES) {
    const { columns, rows } = await exportTable(tableName);
    
    if (rows.length > 0) {
      outputLines.push(`-- Table: ${tableName}`);
      outputLines.push(generateInsert(tableName, columns, rows));
      outputLines.push('');
    }
  }

  const outputPath = path.join(process.cwd(), 'migration-output.sql');
  fs.writeFileSync(outputPath, outputLines.join('\n'));
  
  console.log(`\nMigration SQL written to: ${outputPath}`);
  console.log(`Total tables processed: ${TABLES.length}`);
  console.log('\nNext steps:');
  console.log('1. Review the generated SQL file');
  console.log('2. Run: wrangler d1 execute belive-db --file=migration-output.sql --remote');
  console.log('3. Verify data in D1 dashboard');
}

main().catch(console.error);
