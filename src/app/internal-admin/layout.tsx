import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminBase } from "@/lib/admin-path";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminBaseProvider } from "@/components/admin/AdminBase";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: { default: "Quản trị", template: "%s | Quản trị Dịu Em" }, robots: { index: false, follow: false } };

/**
 * Layout riêng cho admin. URL công khai là /<ADMIN_PATH_SLUG> (lib/admin-path.ts, middleware.ts).
 * Chỉ tài khoản có role admin trong DB (is_admin()) mới thấy; còn lại → 404. Mọi server action cũng tự kiểm tra requireAdmin() + RLS.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const base = getAdminBase();
  if (!base) notFound();
  const admin = await requireAdmin();
  return (
    <AdminBaseProvider base={base}>
      <AdminShell name={admin.name} email={admin.email}>{children}</AdminShell>
    </AdminBaseProvider>
  );
}
