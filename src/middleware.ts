import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_INTERNAL, resolveAdminSlug } from "@/lib/admin-path";

/**
 * Admin chỉ truy cập được qua /<ADMIN_PATH_SLUG>/... ; `/admin` và `/internal-admin` luôn 404.
 * Phản hồi admin gắn `X-Robots-Tag: noindex` và không cache.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const slug = resolveAdminSlug(process.env);

  const direct = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === ADMIN_INTERNAL || pathname.startsWith(`${ADMIN_INTERNAL}/`);
  if (direct) return notFound(req);

  if (slug && (pathname === `/${slug}` || pathname.startsWith(`/${slug}/`))) {
    const url = req.nextUrl.clone();
    url.pathname = ADMIN_INTERNAL + pathname.slice(slug.length + 1);
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }
  return NextResponse.next();
}

function notFound(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/khong-ton-tai-404"; // rơi vào trang 404 chung của site
  return NextResponse.rewrite(url, { status: 404 });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
