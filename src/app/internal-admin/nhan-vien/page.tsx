import { requireAdmin } from "@/lib/admin-auth";
import { listStaff } from "@/lib/admin-data";
import { Badge, PageHeader, Table } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quản trị viên" };

export default async function Page() {
  await requireAdmin();
  const rows = await listStaff();
  return (
    <>
      <PageHeader title="Quản trị viên" subtitle="Hệ thống chỉ có 2 vai trò: khách và admin. Danh sách admin cố định, tạo bằng script seed-admins." />
      <Table head={["Tên", "Email", "Trạng thái"]} empty={rows.length ? undefined : "Chưa có admin (chạy scripts/seed-admins.mjs)."}>
        {rows.map((s) => (
          <tr key={s.id}><td className="font-bold">{s.name}</td><td>{s.email}</td><td><Badge tone={s.status === "active" ? "green" : "gray"}>{s.status}</Badge></td></tr>
        ))}
      </Table>
    </>
  );
}
