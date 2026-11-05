import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Supabase phía server, chạy với quyền CỦA NGƯỜI DÙNG đang đăng nhập (RLS áp dụng).
 * Không dùng service_role trong ứng dụng web.
 */
export async function createClient() {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* gọi từ Server Component: bỏ qua, middleware sẽ làm mới phiên */
        }
      },
    },
  });
}
