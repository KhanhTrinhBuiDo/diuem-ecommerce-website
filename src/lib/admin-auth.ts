import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminUser = { id: string; email: string; name: string };

/** Trả về admin đang đăng nhập hoặc null. Admin = có dòng staff_members(active) + staff_roles('admin') (hàm SQL is_admin()). */
export async function getAdmin(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser(); // getUser() xác thực với server Supabase (không tin cookie thô)
  if (!user) return null;
  const { data: ok } = await sb.rpc("is_admin");
  if (ok !== true) return null;
  const { data: staff } = await sb.from("staff_members").select("full_name").eq("auth_user_id", user.id).maybeSingle();
  return { id: user.id, email: user.email ?? "", name: staff?.full_name ?? user.email ?? "Admin" };
}

/** Dùng ở layout/page/server action của admin. Không phải admin → 404 (không lộ sự tồn tại của trang). */
export async function requireAdmin(): Promise<AdminUser> {
  const a = await getAdmin();
  if (!a) notFound();
  return a;
}
