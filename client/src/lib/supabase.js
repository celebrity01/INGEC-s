import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.REACT_APP_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl || 'https://nfpjfgvqvzhlfggloglb.supabase.co', supabaseKey || 'dummy_key');
