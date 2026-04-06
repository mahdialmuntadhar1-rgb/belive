#!/usr/bin/env node
/**
 * verify-setup.js — Quick dev sanity check
 * Verifies .env.local exists, VITE_SUPABASE_URL is set, and the DB is reachable.
 *
 * Usage: node scripts/verify-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;

// Load .env.local if it exists
let env = {};
const envPath = resolve(ROOT, '.env.local');
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#')) env[key.trim()] = rest.join('=').trim();
  }
  console.log('✓ .env.local found');
} else {
  console.warn('⚠ .env.local not found — using process.env');
  env = process.env;
}

const url = env['VITE_SUPABASE_URL'] || process.env['VITE_SUPABASE_URL'];
const key = env['VITE_SUPABASE_ANON_KEY'] || process.env['VITE_SUPABASE_ANON_KEY'];

if (!url || !key) {
  console.error('✗ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing');
  console.error('  Copy .env.example to .env.local and add your Supabase anon key.');
  process.exit(1);
}
console.log('✓ Supabase URL:', url);

const supabase = createClient(url, key);

async function check() {
  const checks = [
    { name: 'businesses', query: () => supabase.from('businesses').select('id', { count: 'exact', head: true }) },
    { name: 'categories', query: () => supabase.from('categories').select('id', { count: 'exact', head: true }) },
    { name: 'governorates', query: () => supabase.from('governorates').select('id', { count: 'exact', head: true }) },
    { name: 'profiles', query: () => supabase.from('profiles').select('id', { count: 'exact', head: true }) },
    { name: 'posts', query: () => supabase.from('posts').select('id', { count: 'exact', head: true }) },
    { name: 'business_claims', query: () => supabase.from('business_claims').select('id', { count: 'exact', head: true }) },
  ];

  let allOk = true;
  for (const { name, query } of checks) {
    const { count, error } = await query();
    if (error) {
      console.error(`✗ Table "${name}": ${error.message}`);
      allOk = false;
    } else {
      console.log(`✓ Table "${name}": ${count} rows`);
    }
  }

  if (allOk) {
    console.log('\n✓ All checks passed — ready to develop!');
  } else {
    console.error('\n✗ Some checks failed. Run supabase migrations and seeds.');
    process.exit(1);
  }
}

check().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
