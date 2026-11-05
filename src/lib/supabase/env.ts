/** Biến môi trường Supabase (đặt trên Vercel + .env.local). Anon key được phép công khai; bảo vệ bằng RLS. */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);
