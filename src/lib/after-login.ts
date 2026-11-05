"use server";

import { getAdmin } from "@/lib/admin-auth";
import { getAdminBase } from "@/lib/admin-path";

/** Sau khi đăng nhập: admin → vào trang quản trị bí mật; khách → null (ở lại cửa hàng). */
export async function resolveAfterLogin(): Promise<{ redirect: string | null }> {
  const admin = await getAdmin();
  const base = getAdminBase();
  return { redirect: admin && base ? base : null };
}
