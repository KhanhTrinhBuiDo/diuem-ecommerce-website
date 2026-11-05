import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getDashboard } from "@/lib/admin-data";
import { getAdminBase } from "@/lib/admin-path";
import { orderStatusText, type OrderStatus } from "@/lib/admin-types";
import { Badge, Card, PageHeader, StatCard, Table } from "@/components/admin/ui";
import { money } from "@/components/admin/shared";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tổng quan" };

const tone = { pending: "amber", confirmed: "blue", shipping: "pink", completed: "green", cancelled: "gray" } as const;

function RevenueChart({ series }: { series: { d: string; v: number }[] }) {
  const W = 640, H = 200, P = 24;
  const max = Math.max(1, ...series.map((s) => s.v));
  const bw = (W - P * 2) / series.length;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label="Doanh thu 14 ngày gần nhất" className="h-auto w-full">
        <line x1={P} x2={W - P} y1={H} y2={H} stroke="#000" strokeWidth="1" />
        {series.map((s, i) => {
          const h = (s.v / max) * (H - 16);
          return (
            <g key={i}>
              <rect x={P + i * bw + 4} y={H - h} width={bw - 8} height={Math.max(h, s.v ? 2 : 0)} rx="3" fill="#FF66C4" stroke="#000" strokeWidth="1" />
              <text x={P + i * bw + bw / 2} y={H + 16} textAnchor="middle" fontSize="10" fill="#000">{s.d}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        <table>
          <thead><tr><th>Ngày</th><th>Doanh thu</th></tr></thead>
          <tbody>{series.map((s) => <tr key={s.d}><td>{s.d}</td><td>{money(s.v)}</td></tr>)}</tbody>
        </table>
      </figcaption>
    </figure>
  );
}

export default async function Page() {
  await requireAdmin();
  const base = getAdminBase() ?? "";
  const d = await getDashboard();
  return (
    <>
      <PageHeader title="Tổng quan" subtitle="Số liệu lấy trực tiếp từ cơ sở dữ liệu (không tính đơn đã hủy vào doanh thu)." />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard tone="pink" label="Doanh thu hôm nay" value={money(d.revenueToday)} />
        <StatCard label="Doanh thu 14 ngày" value={money(d.revenue14)} hint={`${d.orders14} đơn`} />
        <StatCard tone="dark" label="Đơn chờ xác nhận" value={String(d.pending)} />
        <StatCard label="Khách hàng" value={String(d.customers)} />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Doanh thu 14 ngày"><RevenueChart series={d.series} /></Card>
        <Card title="Đơn theo trạng thái (14 ngày)">
          <ul className="flex flex-col gap-2 text-sm">
            {(Object.keys(orderStatusText) as OrderStatus[]).map((s) => (
              <li key={s} className="flex items-center justify-between">
                <Badge tone={tone[s]}>{orderStatusText[s]}</Badge>
                <b>{d.byStatus[s] ?? 0}</b>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
        <Card title="Đơn mới nhất" action={<Link href={`${base}/don-hang`} className="text-sm underline">Xem tất cả</Link>}>
          <Table head={["Mã", "Khách", "Tổng", "Trạng thái"]} empty={d.latest.length ? undefined : "Chưa có đơn hàng."}>
            {d.latest.map((o) => (
              <tr key={o.id}><td className="font-bold">{o.code}</td><td>{o.name}</td><td>{money(o.total)}</td><td><Badge tone={tone[o.status]}>{orderStatusText[o.status]}</Badge></td></tr>
            ))}
          </Table>
        </Card>
        <Card title="Bán chạy (90 ngày)">
          <Table head={["Sản phẩm", "Đã bán"]} empty={d.top.length ? undefined : "Chưa có dữ liệu."}>
            {d.top.map((t) => <tr key={t.name}><td>{t.name}</td><td className="font-bold">{t.sold}</td></tr>)}
          </Table>
        </Card>
        <Card title="Sắp hết hàng (≤ 10)" action={<Link href={`${base}/san-pham`} className="text-sm underline">Quản lý sản phẩm</Link>} className="xl:col-span-2">
          <Table head={["SKU", "Sản phẩm", "Tồn kho"]} empty={d.lowStock.length ? undefined : "Không có mặt hàng nào sắp hết."}>
            {d.lowStock.map((l) => <tr key={l.sku}><td><code>{l.sku}</code></td><td>{l.name}</td><td className="font-bold">{l.stock}</td></tr>)}
          </Table>
        </Card>
      </div>
    </>
  );
}
