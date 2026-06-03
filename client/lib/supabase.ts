import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase Config:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing',
});

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'PLACEHOLDER_SUPABASE_URL') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✓ Supabase initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize Supabase client:', error);
    supabase = null;
  }
} else {
  console.warn('⚠ Missing or placeholder Supabase credentials. Running in offline mode.');
}

export { supabase };
