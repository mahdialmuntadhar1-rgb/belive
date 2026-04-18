import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

// Use Supabase Management API to execute SQL
const managementUrl = 'https://api.supabase.com/v1/projects';

async function executeSQL() {
  console.log('=== Executing SQL via Supabase Management API ===\n');

  // Need project ref from URL
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

  try {
    // Try to execute via SQL endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        query: `
          CREATE OR REPLACE FUNCTION public.handle_new_user()
          RETURNS TRIGGER AS $$
          BEGIN
            INSERT INTO public.profiles (id, full_name, avatar_url, role, created_at, updated_at)
            VALUES (
              new.id,
              new.raw_user_meta_data->>'full_name',
              new.raw_user_meta_data->>'avatar_url',
              COALESCE(new.raw_user_meta_data->>'role', 'user'),
              NOW(),
              NOW()
            )
            ON CONFLICT (id) DO UPDATE
            SET
              full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
              role = COALESCE(EXCLUDED.role, profiles.role),
              updated_at = NOW();
            RETURN new;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      }),
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response:', text);

    if (response.ok) {
      console.log('✓ SQL executed');
      return { success: true };
    } else {
      console.log('❌ SQL execution failed');
      return { success: false, error: text };
    }

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { success: false, error: e.message };
  }
}

executeSQL().catch(console.error);
