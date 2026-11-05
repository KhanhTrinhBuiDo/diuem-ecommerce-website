import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminUser = { id: string; email: string; name: string };

/** Trả về admin đang đăng nhập hoặc null. Admin = có dòng staff_members(active) + staff_roles('admin') (hàm SQL is_admin()). */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  if (!isSupabaseConfigured()) return null;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser(); // getUser() xác thực với server Supabase (không tin cookie thô)
  if (!user) return null;
  // 2 truy vấn chạy song song; cache() giúp layout + page + action trong cùng 1 request chỉ kiểm tra 1 lần
  const [{ data: ok }, { data: staff }] = await Promise.all([
    sb.rpc("is_admin"),
    sb.from("staff_members").select("full_name").eq("auth_user_id", user.id).maybeSingle(),
  ]);
  if (ok !== true) return null;
  return { id: user.id, email: user.email ?? "", name: staff?.full_name ?? user.email ?? "Admin" };
});

/** Dùng ở layout/page/server action của admin. Không phải admin → 404 (không lộ sự tồn tại của trang). */
export async function requireAdmin(): Promise<AdminUser> {
  const a = await getAdmin();
  if (!a) notFound();
  return a;
}
