import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/lib/admin-auth";
import { getAdminBase } from "@/lib/admin-path";
import { createClient } from "@/lib/supabase/server";

/** Đích quay về của Google OAuth / liên kết xác nhận email: đổi `code` lấy phiên, rồi chuyển theo role. */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  if (code) {
    const sb = await createClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) {
      const admin = await getAdmin();
      const base = getAdminBase();
      if (admin && base) return NextResponse.redirect(`${origin}${base}`);
      // chỉ cho phép đường dẫn nội bộ (chống open redirect)
      return NextResponse.redirect(`${origin}${next.startsWith("/") && !next.startsWith("//") ? next : "/"}`);
    }
  }
  return NextResponse.redirect(`${origin}/?auth=error`);
}
