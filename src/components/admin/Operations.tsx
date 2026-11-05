"use client";

import { useMemo, useState } from "react";
import { Badge, Dialog, Field, PageHeader, SearchInput, Table, Toggle } from "@/components/admin/ui";
import { btn, inputCls, money } from "@/components/admin/shared";
import {
  adminCustomers, adminOrders, adminReviews, defaultSettings, orderStatusText, orderTotal,
  type AdminCustomer, type AdminOrder, type AdminOrderStatus, type AdminReview,
} from "@/data/admin";

const statusTone: Record<AdminOrderStatus, "amber" | "blue" | "pink" | "green" | "gray" | "red"> = {
  pending: "amber", confirmed: "blue", shipping: "pink", completed: "green", cancelled: "gray", returned: "red",
};
const fmtDate = (d: string) => d.split("-").reverse().join("/");

/* ───────────── Đơn hàng ───────────── */
export function OrdersManager() {
  const [orders, setOrders] = useState<AdminOrder[]>(adminOrders);
  const [tab, setTab] = useState<"all" | AdminOrderStatus>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<AdminOrder | null>(null);

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return orders.filter((o) => (tab === "all" || o.status === tab) && (!n || `${o.code} ${o.customer} ${o.phone}`.toLowerCase().includes(n)));
  }, [orders, tab, q]);
  const setStatus = (id: string, status: AdminOrderStatus) => {
    setOrders((l) => l.map((o) => (o.id === id ? { ...o, status } : o)));
    setView((v) => (v && v.id === id ? { ...v, status } : v));
  };
  const tabs: ("all" | AdminOrderStatus)[] = ["all", "pending", "confirmed", "shipping", "completed", "cancelled", "returned"];

  return (
    <>
      <PageHeader title="Đơn hàng" subtitle="Xác nhận, cập nhật trạng thái giao hàng." />
      <div role="tablist" aria-label="Lọc theo trạng thái" className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-full border-2 border-black px-4 py-1.5 text-sm ${tab === t ? "bg-black font-bold text-white" : "bg-white"}`}>
            {t === "all" ? "Tất cả" : orderStatusText[t]} ({t === "all" ? orders.length : orders.filter((o) => o.status === t).length})
          </button>
        ))}
      </div>
      <div className="mb-4">
        <SearchInput value={q} onChange={setQ} placeholder="Mã đơn, tên, SĐT..." />
      </div>
      <Table head={["Mã đơn", "Khách hàng", "Ngày", "Tổng tiền", "Thanh toán", "Trạng thái", "Thao tác"]} empty={shown.length ? undefined : "Không có đơn hàng nào."}>
        {shown.map((o) => (
          <tr key={o.id}>
            <td><code className="text-xs font-bold">{o.code}</code></td>
            <td><p className="font-medium">{o.customer}</p><p className="text-xs font-light text-black/50">{o.phone}</p></td>
            <td>{fmtDate(o.date)}</td>
            <td className="whitespace-nowrap font-bold">{money(orderTotal(o))}</td>
            <td>{o.payment}</td>
            <td><Badge tone={statusTone[o.status]}>{orderStatusText[o.status]}</Badge></td>
            <td>
              <div className="flex items-center gap-2">
                <button type="button" className={btn.small} onClick={() => setView(o)}>Chi tiết</button>
                <label>
                  <span className="sr-only">Đổi trạng thái đơn {o.code}</span>
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value as AdminOrderStatus)} className="h-8 rounded-full border border-black bg-white px-2 text-xs">
                    {Object.entries(orderStatusText).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Dialog open={!!view} onClose={() => setView(null)} title={view ? `Đơn ${view.code}` : ""} wide>
        {view && (
          <div className="flex flex-col gap-5 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs font-bold uppercase text-black/50">Khách hàng</p><p className="font-medium">{view.customer}</p><p className="font-light">{view.phone}</p><p className="font-light">{view.address}</p></div>
              <div><p className="text-xs font-bold uppercase text-black/50">Đơn hàng</p><p>Ngày đặt: {fmtDate(view.date)}</p><p>Thanh toán: {view.payment}</p><p className="mt-1"><Badge tone={statusTone[view.status]}>{orderStatusText[view.status]}</Badge></p></div>
            </div>
            <Table head={["Sản phẩm", "SL", "Đơn giá", "Thành tiền"]}>
              {view.items.map((i) => (
                <tr key={i.name}><td>{i.name}</td><td>{i.qty}</td><td>{money(i.price)}</td><td>{money(i.qty * i.price)}</td></tr>
              ))}
            </Table>
            <dl className="ml-auto grid w-full max-w-[320px] grid-cols-[1fr_auto] gap-x-6 gap-y-1">
              <dt className="font-light">Phí giao hàng</dt><dd className="text-right">{view.shipping ? money(view.shipping) : "Miễn phí"}</dd>
              <dt className="font-light">Voucher</dt><dd className="text-right">−{money(view.voucher)}</dd>
              <dt className="border-t border-black pt-2 font-bold">Thành tiền</dt><dd className="border-t border-black pt-2 text-right text-base font-bold">{money(orderTotal(view))}</dd>
            </dl>
            <div className="flex flex-wrap justify-end gap-3">
              {view.status === "pending" && <button type="button" className={btn.primary} onClick={() => setStatus(view.id, "confirmed")}>Xác nhận đơn</button>}
              {view.status === "confirmed" && <button type="button" className={btn.primary} onClick={() => setStatus(view.id, "shipping")}>Giao cho đơn vị vận chuyển</button>}
              {view.status === "shipping" && <button type="button" className={btn.primary} onClick={() => setStatus(view.id, "completed")}>Đánh dấu hoàn thành</button>}
              {(view.status === "pending" || view.status === "confirmed") && <button type="button" className={btn.danger} onClick={() => setStatus(view.id, "cancelled")}>Hủy đơn</button>}
              <button type="button" className={btn.outline} onClick={() => window.print()}>In đơn</button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

/* ───────────── Khách hàng ───────────── */
export function CustomersManager() {
  const [list, setList] = useState<AdminCustomer[]>(adminCustomers);
  const [q, setQ] = useState("");
  const shown = list.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <PageHeader title="Khách hàng" subtitle="Danh sách tài khoản khách." />
      <div className="mb-4"><SearchInput value={q} onChange={setQ} placeholder="Tên, email, SĐT..." /></div>
      <Table head={["Khách hàng", "Liên hệ", "Ngày tham gia", "Số đơn", "Tổng chi tiêu", "Trạng thái", "Thao tác"]} empty={shown.length ? undefined : "Không tìm thấy khách hàng."}>
        {shown.map((c) => (
          <tr key={c.id}>
            <td className="font-medium">{c.name}</td>
            <td><p>{c.email}</p><p className="text-xs font-light text-black/50">{c.phone}</p></td>
            <td>{fmtDate(c.joined)}</td>
            <td>{c.orders}</td>
            <td className="whitespace-nowrap">{money(c.spent)}</td>
            <td><Badge tone={c.locked ? "red" : "green"}>{c.locked ? "Đã khóa" : "Hoạt động"}</Badge></td>
            <td>
              <button type="button" className={c.locked ? btn.small : "inline-flex h-8 items-center rounded-full border border-red-600 px-3 text-xs font-medium text-red-600 hover:bg-red-600 hover:text-white"} onClick={() => setList((l) => l.map((x) => (x.id === c.id ? { ...x, locked: !x.locked } : x)))}>
                {c.locked ? "Mở khóa" : "Khóa"}
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

/* ───────────── Đánh giá ───────────── */
const reviewTone = { pending: ["amber", "Chờ duyệt"], approved: ["green", "Đã hiện"], hidden: ["gray", "Đã ẩn"] } as const;
export function ReviewsManager() {
  const [list, setList] = useState<AdminReview[]>(adminReviews);
  const [tab, setTab] = useState<"all" | AdminReview["status"]>("all");
  const [reply, setReply] = useState<AdminReview | null>(null);
  const [text, setText] = useState("");
  const shown = list.filter((r) => tab === "all" || r.status === tab);
  const set = (id: string, p: Partial<AdminReview>) => setList((l) => l.map((r) => (r.id === id ? { ...r, ...p } : r)));
  return (
    <>
      <PageHeader title="Đánh giá" subtitle="Duyệt, ẩn và phản hồi đánh giá của khách." />
      <div role="tablist" className="mb-4 flex gap-2 overflow-x-auto">
        {(["all", "pending", "approved", "hidden"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-full border-2 border-black px-4 py-1.5 text-sm ${tab === t ? "bg-black font-bold text-white" : "bg-white"}`}>
            {t === "all" ? "Tất cả" : reviewTone[t][1]} ({t === "all" ? list.length : list.filter((r) => r.status === t).length})
          </button>
        ))}
      </div>
      <ul className="flex flex-col gap-4">
        {shown.length === 0 && <li className="text-sm font-light">Không có đánh giá nào.</li>}
        {shown.map((r) => (
          <li key={r.id} className="rounded-[20px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm"><strong>{r.author}</strong> · <span className="font-light">{r.product}</span> · <span className="font-light">{fmtDate(r.date)}</span></p>
              <Badge tone={reviewTone[r.status][0]}>{reviewTone[r.status][1]}</Badge>
            </div>
            <p role="img" aria-label={`${r.rating} trên 5 sao`} className="mt-1 text-base tracking-widest">{"★".repeat(r.rating)}<span className="text-black/20">{"★".repeat(5 - r.rating)}</span></p>
            <p className="mt-2 text-sm font-light">{r.content}</p>
            {r.reply && <p className="mt-3 rounded-[10px] border-l-4 border-line bg-black/5 p-3 text-sm"><strong>Dịu Em phản hồi:</strong> {r.reply}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {r.status !== "approved" && <button type="button" className={btn.small} onClick={() => set(r.id, { status: "approved" })}>Duyệt & hiện</button>}
              {r.status !== "hidden" && <button type="button" className={btn.small} onClick={() => set(r.id, { status: "hidden" })}>Ẩn</button>}
              <button type="button" className={btn.small} onClick={() => { setReply(r); setText(r.reply); }}>{r.reply ? "Sửa phản hồi" : "Phản hồi"}</button>
            </div>
          </li>
        ))}
      </ul>
      <Dialog open={!!reply} onClose={() => setReply(null)} title="Phản hồi đánh giá">
        {reply && (
          <form onSubmit={(e) => { e.preventDefault(); set(reply.id, { reply: text.trim() }); setReply(null); }} className="flex flex-col gap-4">
            <p className="text-sm font-light">“{reply.content}”</p>
            <Field label="Nội dung phản hồi"><textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className={`${inputCls} h-auto py-3`} /></Field>
            <div className="flex justify-end gap-3"><button type="button" className={btn.outline} onClick={() => setReply(null)}>Hủy</button><button type="submit" className={btn.primary}>Lưu phản hồi</button></div>
          </form>
        )}
      </Dialog>
    </>
  );
}

/* ───────────── Cài đặt ───────────── */
export function SettingsForm() {
  const [s, setS] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);
  const up = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => { setS((x) => ({ ...x, [k]: v })); setSaved(false); };
  return (
    <>
      <PageHeader title="Cài đặt" subtitle="Thông tin cửa hàng, phí giao hàng, đổi trả." />
      <form onSubmit={(e) => { e.preventDefault(); setSaved(true); }} className="grid max-w-[820px] gap-4 rounded-[20px] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.12)] sm:grid-cols-2">
        <Field label="Tên cửa hàng"><input className={inputCls} value={s.storeName} onChange={(e) => up("storeName", e.target.value)} /></Field>
        <Field label="Hotline"><input className={inputCls} value={s.hotline} onChange={(e) => up("hotline", e.target.value)} /></Field>
        <Field label="Email liên hệ"><input type="email" className={inputCls} value={s.email} onChange={(e) => up("email", e.target.value)} /></Field>
        <Field label="Số ngày đổi trả"><input type="number" min={0} className={inputCls} value={s.returnDays} onChange={(e) => up("returnDays", Number(e.target.value))} /></Field>
        <Field label="Freeship từ (VND)"><input type="number" min={0} className={inputCls} value={s.freeShipFrom} onChange={(e) => up("freeShipFrom", Number(e.target.value))} /></Field>
        <Field label="Phí giao hàng (VND)"><input type="number" min={0} className={inputCls} value={s.shippingFee} onChange={(e) => up("shippingFee", Number(e.target.value))} /></Field>
        <div className="flex items-center justify-between gap-3 text-sm sm:col-span-2">
          <span><strong className="font-medium">Chế độ bảo trì</strong><span className="block text-xs font-light text-black/60">Khách sẽ thấy trang thông báo thay vì cửa hàng.</span></span>
          <Toggle checked={s.maintenance} onChange={(v) => up("maintenance", v)} label="Chế độ bảo trì" />
        </div>
        <div className="flex items-center justify-end gap-4 sm:col-span-2">
          <p role="status" className="text-sm text-green-700">{saved ? "Đã lưu (chỉ trên trình duyệt – chưa nối database)." : ""}</p>
          <button type="submit" className={btn.primary}>Lưu cài đặt</button>
        </div>
      </form>
    </>
  );
}

// TODO(supabase): đơn/khách/đánh giá/cài đặt đọc-ghi qua server action; gửi email/SMS khi đổi trạng thái đơn.
// TODO(reviews): quy tắc ai được đánh giá/sửa chưa chốt (câu hỏi mở 18, 21).
