import type { Metadata } from "next";
import Link from "next/link";
import { getAdminBase } from "@/lib/admin-path";
import { Badge, Card, PageHeader, StatCard } from "@/components/admin/ui";
import { btn, money } from "@/components/admin/shared";
import { adminCustomers, adminOrders, adminProducts, adminReviews, orderStatusText, orderTotal, revenueSeries, type AdminOrderStatus } from "@/data/admin";

export const metadata: Metadata = { title: "Dashboard" };

const statusTone = { pending: "amber", confirmed: "blue", shipping: "pink", completed: "green", cancelled: "gray", returned: "red" } as const;

/** Dashboard: số liệu tính từ dữ liệu mẫu trong src/data/admin.ts. TODO(supabase): thay bằng truy vấn tổng hợp (view/RPC) theo khoảng ngày. */
export default function Page() {
  const base = getAdminBase() ?? "";
  const total14 = revenueSeries.reduce((s, x) => s + x.v, 0);
  const today = revenueSeries[revenueSeries.length - 1].v;
  const pending = adminOrders.filter((o) => o.status === "pending").length;
  const pendingReviews = adminReviews.filter((r) => r.status === "pending").length;
  const lowStock = adminProducts.filter((p) => p.status !== "hidden" && p.stock <= 10);
  const top = [...adminProducts].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const byStatus = (Object.keys(orderStatusText) as AdminOrderStatus[]).map((k) => ({ k, n: adminOrders.filter((o) => o.status === k).length }));
  const maxStatus = Math.max(...byStatus.map((x) => x.n), 1);
  const max = Math.max(...revenueSeries.map((x) => x.v));
  const W = 700, H = 220, pad = 28, bw = (W - pad * 2) / revenueSeries.length;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Tổng quan hoạt động cửa hàng (dữ liệu mẫu)" actions={<Link href={`${base}/san-pham`} className={btn.primary}>+ Thêm sản phẩm</Link>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="dark" label="Doanh thu 14 ngày" value={money(total14)} hint={`Hôm nay: ${money(today)}`} />
        <StatCard tone="pink" label="Đơn chờ xác nhận" value={String(pending)} hint={`${adminOrders.length} đơn gần đây`} />
        <StatCard label="Khách hàng" value={String(adminCustomers.length)} hint="Tài khoản đã đăng ký" />
        <StatCard label="Đánh giá chờ duyệt" value={String(pendingReviews)} hint={`${lowStock.length} sản phẩm sắp hết hàng`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Doanh thu theo ngày">
          <svg viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label={`Biểu đồ cột doanh thu 14 ngày, cao nhất ${money(max)}`} className="w-full">
            {[0, 0.5, 1].map((t) => (
              <line key={t} x1={pad} x2={W - pad} y1={H - t * (H - 20)} y2={H - t * (H - 20)} stroke="#d9d9d9" strokeDasharray="4 4" />
            ))}
            {revenueSeries.map((x, i) => {
              const h = (x.v / max) * (H - 20);
              const last = i === revenueSeries.length - 1;
              return (
                <g key={x.d}>
                  <rect x={pad + i * bw + 5} y={H - h} width={bw - 10} height={h} rx="4" fill={last ? "#000" : "#ff66c4"}>
                    <title>{`${x.d}: ${money(x.v)}`}</title>
                  </rect>
                  <text x={pad + i * bw + bw / 2} y={H + 16} textAnchor="middle" fontSize="10" fill="#555">{x.d.slice(0, 5)}</text>
                </g>
              );
            })}
          </svg>
          <table className="sr-only">
            <caption>Doanh thu theo ngày</caption>
            <tbody>{revenueSeries.map((x) => <tr key={x.d}><th scope="row">{x.d}</th><td>{money(x.v)}</td></tr>)}</tbody>
          </table>
        </Card>

        <Card title="Đơn hàng theo trạng thái">
          <ul className="flex flex-col gap-3">
            {byStatus.map(({ k, n }) => (
              <li key={k} className="text-sm">
                <div className="mb-1 flex justify-between"><span>{orderStatusText[k]}</span><strong>{n}</strong></div>
                <div className="h-2.5 rounded-full bg-black/10"><div className="h-full rounded-full bg-black" style={{ width: `${(n / maxStatus) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Đơn hàng mới nhất" action={<Link href={`${base}/don-hang`} className="text-sm font-medium underline">Xem tất cả</Link>}>
          <ul className="flex flex-col divide-y divide-rule">
            {adminOrders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0"><p className="font-medium">{o.customer}</p><p className="text-xs font-light text-black/50">{o.code}</p></div>
                <div className="flex flex-none items-center gap-3"><span className="font-bold">{money(orderTotal(o))}</span><Badge tone={statusTone[o.status]}>{orderStatusText[o.status]}</Badge></div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Sản phẩm bán chạy" action={<Link href={`${base}/san-pham`} className="text-sm font-medium underline">Quản lý</Link>}>
          <ol className="flex flex-col divide-y divide-rule">
            {top.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="grid size-7 flex-none place-items-center rounded-full bg-line font-bold">{i + 1}</span>
                <span className="min-w-0 flex-1 font-medium">{p.name}</span>
                <span className="font-light">{p.sold} đã bán</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card title="Cảnh báo tồn kho" className="mt-6" action={<Link href={`${base}/san-pham`} className="text-sm font-medium underline">Nhập hàng</Link>}>
        {lowStock.length === 0 ? (
          <p className="text-sm font-light">Không có sản phẩm nào sắp hết hàng.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-[10px] border-2 border-black px-4 py-3 text-sm">
                <span className="font-medium">{p.name}</span>
                <Badge tone={p.stock === 0 ? "red" : "amber"}>{p.stock === 0 ? "Hết hàng" : `Còn ${p.stock}`}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
