import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Use service key on the backend to bypass RLS if needed, or use public key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl || 'https://nfpjfgvqvzhlfggloglb.supabase.co', supabaseKey || 'dummy_key');
