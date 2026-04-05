// Test the Supabase configuration
import { getSupabaseConfig } from './src/config/supabase-config.ts';

console.log('🔍 Testing Supabase configuration...');

const config = getSupabaseConfig();

console.log('✅ Configuration loaded:');
console.log(`  URL: ${config.url}`);
console.log(`  Key: ${config.anonKey ? 'Present' : 'Missing'}`);

if (config.url && config.anonKey) {
  console.log('🎉 Supabase configuration is ready!');
} else {
  console.log('❌ Supabase configuration is incomplete');
}
