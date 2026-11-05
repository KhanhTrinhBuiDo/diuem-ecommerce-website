import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/** Supabase phía trình duyệt (đăng nhập/đăng xuất, đọc dữ liệu công khai). */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
