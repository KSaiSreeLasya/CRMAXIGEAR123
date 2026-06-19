import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase Config:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0,
});

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('PLACEHOLDER')) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✓ Supabase initialized successfully with URL:', supabaseUrl);
  } catch (error) {
    console.error('✗ Failed to initialize Supabase client:', error);
    supabase = null;
  }
} else {
  console.warn('⚠ Missing or placeholder Supabase credentials.', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlValue: supabaseUrl,
  });
}

export { supabase };
