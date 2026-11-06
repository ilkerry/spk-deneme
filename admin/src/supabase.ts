import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const configured = !!url && !!key && !url.includes('PROJE-KODUNUZ');
export const supabase = createClient(configured ? url! : 'http://localhost', configured ? key! : 'x');
