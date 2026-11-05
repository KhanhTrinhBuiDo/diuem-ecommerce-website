import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_INTERNAL, resolveAdminSlug } from "@/lib/admin-path";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * 1) Admin chỉ truy cập qua /<ADMIN_PATH_SLUG>/... ; `/admin` và `/internal-admin` luôn 404.
 * 2) Làm mới phiên Supabase (cookie) cho mọi request.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const slug = resolveAdminSlug(process.env);

  const direct = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === ADMIN_INTERNAL || pathname.startsWith(`${ADMIN_INTERNAL}/`);
  let res: NextResponse;
  if (direct) {
    const url = req.nextUrl.clone();
    url.pathname = "/khong-ton-tai-404";
    return NextResponse.rewrite(url, { status: 404 });
  } else if (slug && (pathname === `/${slug}` || pathname.startsWith(`/${slug}/`))) {
    const url = req.nextUrl.clone();
    url.pathname = ADMIN_INTERNAL + pathname.slice(slug.length + 1);
    res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "private, no-store");
  } else {
    res = NextResponse.next();
  }

  // Chỉ làm mới phiên khi request có cookie đăng nhập (khách chưa đăng nhập không tốn lượt gọi Supabase)
  if (isSupabaseConfigured() && req.cookies.getAll().some((c) => c.name.startsWith("sb-"))) {
    const sb = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });
    await sb.auth.getClaims(); // xác thực JWT tại chỗ, chỉ gọi mạng khi cần làm mới token
  }
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
