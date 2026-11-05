import { requireAdmin } from "@/lib/admin-auth";
import { listCustomers } from "@/lib/admin-data";
import { PageHeader, Table } from "@/components/admin/ui";
import { money } from "@/components/admin/shared";

export const dynamic = "force-dynamic";
export const metadata = { title: "Khách hàng" };

export default async function Page() {
  await requireAdmin();
  const rows = await listCustomers();
  return (
    <>
      <PageHeader title="Khách hàng" subtitle="Chỉ xem. Khách tự tạo tài khoản khi đăng ký trên website." />
      <Table head={["Tên", "Email", "SĐT", "Ngày tham gia", "Số đơn", "Đã chi"]} empty={rows.length ? undefined : "Chưa có khách hàng."}>
        {rows.map((c) => (
          <tr key={c.id}><td className="font-bold">{c.name}</td><td>{c.email}</td><td>{c.phone || "—"}</td><td>{c.joined}</td><td>{c.orders}</td><td>{money(c.spent)}</td></tr>
        ))}
      </Table>
    </>
  );
}
