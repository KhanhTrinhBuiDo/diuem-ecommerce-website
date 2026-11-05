import type { Metadata } from "next";
import { getAdminBase } from "@/lib/admin-path";
import { notFound } from "next/navigation";
import { AdminBaseProvider } from "@/components/admin/AdminBase";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: { default: "Quản trị", template: "%s | Quản trị Dịu Em" }, robots: { index: false, follow: false } };

/**
 * Layout riêng cho admin (không dùng header/footer cửa hàng). URL công khai là /<ADMIN_PATH_SLUG> (xem lib/admin-path.ts, middleware.ts).
 *
 * TODO(auth) QUAN TRỌNG: hiện CHƯA có đăng nhập thật, nên khu này chỉ mở khi chạy dev hoặc đặt ADMIN_PREVIEW=1.
 * Khi có Supabase Auth: đọc session phía server → nếu profiles.role !== "admin" thì notFound()/redirect;
 * đăng nhập bình thường, tài khoản role=admin sẽ được chuyển vào /admin (xem docs/PROJECT_LOG.md).
 * Mọi thao tác ghi phải kiểm tra role ở server + RLS, không chỉ ẩn nút ở giao diện.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && process.env.ADMIN_PREVIEW !== "1") notFound();
  const base = getAdminBase();
  if (!base) notFound();
  return (
    <AdminBaseProvider base={base}>
      <AdminShell>{children}</AdminShell>
    </AdminBaseProvider>
  );
}
