"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { updateOrder } from "@/app/internal-admin/actions";
import { btn, inputCls, money } from "@/components/admin/shared";
import { Badge, Dialog, Field, PageHeader, SearchInput, Table } from "@/components/admin/ui";
import { orderNext, orderStatusText, paymentMethodText, paymentStatusText, type OrderRow, type OrderStatus } from "@/lib/admin-types";

const tone: Record<OrderStatus, "amber" | "blue" | "pink" | "green" | "gray"> = { pending: "amber", confirmed: "blue", shipping: "pink", completed: "green", cancelled: "gray" };
const fmt = (iso: string) => new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" });

export function OrdersAdmin({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | OrderStatus>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const view = orders.find((o) => o.id === openId) ?? null;

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return orders.filter((o) => (tab === "all" || o.status === tab) && (!n || `${o.order_number} ${o.contact_name} ${o.contact_phone}`.toLowerCase().includes(n)));
  }, [orders, tab, q]);

  function open(o: OrderRow) {
    setOpenId(o.id);
    setCarrier(o.carrier ?? "");
    setTracking(o.tracking_code ?? "");
    setError("");
  }
  async function apply(o: OrderRow, status?: OrderStatus) {
    setBusy(true);
    setError("");
    const r = await updateOrder(o.id, { status, carrier, tracking_code: tracking });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    router.refresh();
  }
  const tabs: ("all" | OrderStatus)[] = ["all", "pending", "confirmed", "shipping", "completed", "cancelled"];

  return (
    <>
      <PageHeader title="Đơn hàng" subtitle="Xác nhận, giao hàng và cập nhật trạng thái đơn." />
      <div role="tablist" aria-label="Lọc theo trạng thái" className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-full border-2 border-black px-4 py-1.5 text-sm ${tab === t ? "bg-black font-bold text-white" : "bg-white"}`}>
            {t === "all" ? "Tất cả" : orderStatusText[t]} ({t === "all" ? orders.length : orders.filter((o) => o.status === t).length})
          </button>
        ))}
      </div>
      <div className="mb-4"><SearchInput value={q} onChange={setQ} placeholder="Mã đơn, tên, SĐT..." /></div>
      <Table head={["Mã đơn", "Khách hàng", "Thời gian", "Tổng tiền", "Thanh toán", "Trạng thái", ""]} empty={shown.length ? undefined : "Không có đơn hàng nào."}>
        {shown.map((o) => (
          <tr key={o.id}>
            <td><code className="text-xs font-bold">{o.order_number}</code></td>
            <td><p className="font-medium">{o.contact_name}</p><p className="text-xs font-light text-black/50">{o.contact_phone}</p></td>
            <td className="whitespace-nowrap">{fmt(o.placed_at)}</td>
            <td className="whitespace-nowrap font-bold">{money(o.total_vnd)}</td>
            <td>{paymentMethodText[o.payment_method] ?? o.payment_method}<p className="text-xs font-light text-black/50">{paymentStatusText[o.payment_status] ?? o.payment_status}</p></td>
            <td><Badge tone={tone[o.status]}>{orderStatusText[o.status]}</Badge></td>
            <td><button type="button" className={btn.small} onClick={() => open(o)}>Chi tiết</button></td>
          </tr>
        ))}
      </Table>

      <Dialog open={!!view} onClose={() => setOpenId(null)} title={view ? `Đơn ${view.order_number}` : ""} wide>
        {view && (
          <div className="flex flex-col gap-5 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs font-bold uppercase text-black/50">Người đặt</p><p className="font-medium">{view.contact_name}</p><p className="font-light">{view.contact_phone}{view.contact_email ? ` · ${view.contact_email}` : ""}</p></div>
              <div><p className="text-xs font-bold uppercase text-black/50">Giao tới</p><p className="font-medium">{view.ship_name} · {view.ship_phone}</p><p className="font-light">{view.ship_address}</p></div>
            </div>
            {(view.is_gift || view.customer_note) && (
              <div className="rounded-[10px] bg-black/5 p-3">
                {view.is_gift && <p><strong>Quà tặng:</strong> {view.gift_message || "(không có lời nhắn)"}</p>}
                {view.customer_note && <p><strong>Ghi chú:</strong> {view.customer_note}</p>}
              </div>
            )}
            <Table head={["Sản phẩm", "SKU", "SL", "Đơn giá", "Thành tiền"]}>
              {view.items.map((i) => <tr key={i.id}><td>{i.product_name}</td><td className="text-xs">{i.sku}</td><td>{i.quantity}</td><td>{money(i.unit_price_vnd)}</td><td>{money(i.line_total_vnd)}</td></tr>)}
            </Table>
            <dl className="ml-auto grid w-full max-w-[340px] grid-cols-[1fr_auto] gap-x-6 gap-y-1">
              <dt className="font-light">Tạm tính</dt><dd className="text-right">{money(view.subtotal_vnd)}</dd>
              <dt className="font-light">Phí giao hàng</dt><dd className="text-right">{view.shipping_fee_vnd ? money(view.shipping_fee_vnd) : "Miễn phí"}</dd>
              <dt className="font-light">Giảm giá{view.coupon_code ? ` (${view.coupon_code})` : ""}</dt><dd className="text-right">−{money(view.discount_vnd)}</dd>
              <dt className="border-t border-black pt-2 font-bold">Thành tiền</dt><dd className="border-t border-black pt-2 text-right text-base font-bold">{money(view.total_vnd)}</dd>
            </dl>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Đơn vị vận chuyển"><input className={inputCls} value={carrier} onChange={(e) => setCarrier(e.target.value)} /></Field>
              <Field label="Mã vận đơn"><input className={inputCls} value={tracking} onChange={(e) => setTracking(e.target.value)} /></Field>
            </div>
            <p>Trạng thái: <Badge tone={tone[view.status]}>{orderStatusText[view.status]}</Badge></p>
            {error && <p role="alert" className="text-red-600">{error}</p>}
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" className={btn.outline} disabled={busy} onClick={() => apply(view)}>Lưu vận chuyển</button>
              {orderNext[view.status].filter((s) => s !== "cancelled").map((s) => <button key={s} type="button" disabled={busy} className={btn.primary} onClick={() => apply(view, s)}>→ {orderStatusText[s]}</button>)}
              {orderNext[view.status].includes("cancelled") && <button type="button" disabled={busy} className={btn.danger} onClick={() => apply(view, "cancelled")}>Hủy đơn</button>}
              <button type="button" className={btn.outline} onClick={() => window.print()}>In đơn</button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
