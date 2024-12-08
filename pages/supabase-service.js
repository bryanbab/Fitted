import { createClient } from '@supabase/supabase-js';
// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://jnwydjjsvdkifjnbmkzk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impud3lkampzdmRraWZqbmJta3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzODg3OTQsImV4cCI6MjA0Njk2NDc5NH0.1SYDj4Eol3fvxEBgkpn_WqcUZR0MfHJ5Kekjo-uK30c';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;