"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adjustStock } from "@/app/internal-admin/actions";
import { btn, inputCls } from "@/components/admin/shared";
import { Badge, Card, PageHeader, SearchInput, Table } from "@/components/admin/ui";
import type { MovementRow, StockRow } from "@/lib/admin-data";

const REASON: Record<MovementRow["reason"], string> = { order: "Khách đặt hàng", cancel: "Hoàn kho (hủy đơn)", adjust: "Điều chỉnh" };
const when = (iso: string) => new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" }).format(new Date(iso));

/**
 * Kho hàng: nhập/điều chỉnh tồn hàng loạt (đặt "tồn mới" cho từng SKU) + nhật ký biến động.
 * Chỉ các dòng bạn sửa mới được gửi; server ghi mỗi thay đổi vào `stock_movements` kèm ghi chú.
 */
export function StockAdmin({ rows, moves }: { rows: StockRow[]; moves: MovementRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"stock" | "log">("stock");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Record<string, string>>({});
  const [lowOnly, setLowOnly] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const byKey = useMemo(() => new Map(rows.map((r) => [r.sku, r])), [rows]);
  const changes = Object.entries(edit).flatMap(([sku, v]) => {
    const cur = byKey.get(sku);
    if (!cur || v.trim() === "") return [];
    const n = Number(v);
    return Number.isInteger(n) && n !== cur.stock ? [{ sku, qty: n }] : [];
  });
  const invalid = Object.entries(edit).filter(([, v]) => v.trim() !== "" && !/^\d{1,6}$/.test(v.trim())).length;
  const needle = q.trim().toLowerCase();
  const shown = rows.filter((r) => (!needle || `${r.product} ${r.sku} ${r.variant}`.toLowerCase().includes(needle)) && (!lowOnly || r.stock <= 5));
  const shownMoves = moves.filter((m) => !needle || `${m.product} ${m.sku} ${m.orderNumber} ${m.note}`.toLowerCase().includes(needle));

  async function save() {
    if (!changes.length || invalid) return;
    setBusy(true);
    setMsg(null);
    const r = await adjustStock(changes, note).catch(() => ({ ok: false as const, error: "Không kết nối được máy chủ." }));
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, text: r.error });
    setMsg({ ok: true, text: `Đã cập nhật tồn kho ${r.changed} SKU.` });
    setEdit({});
    setNote("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Kho hàng" subtitle="Nhập tồn mới cho nhiều SKU rồi lưu một lần. Đơn mới tự trừ kho, đơn hủy tự hoàn kho; mọi biến động đều có nhật ký." />
      <div role="tablist" aria-label="Kho hàng" className="flex gap-2">
        {([["stock", "Tồn kho"], ["log", "Nhật ký biến động"]] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} type="button" onClick={() => setTab(id)} className={`rounded-full border border-black px-5 py-2 text-sm ${tab === id ? "bg-black text-white" : ""}`}>{label}</button>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder={tab === "stock" ? "Tìm sản phẩm, SKU…" : "Tìm sản phẩm, SKU, mã đơn, ghi chú…"} />
          {tab === "stock" && (
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Chỉ tồn ≤ 5</label>
          )}
        </div>

        {tab === "stock" ? (
          <>
            <Table head={["Sản phẩm", "SKU", "Phân loại", "Tồn hiện tại", "Tồn mới"]} empty={shown.length ? undefined : "Không có SKU phù hợp."}>
              {shown.map((r) => {
                const v = edit[r.sku] ?? "";
                const bad = v.trim() !== "" && !/^\d{1,6}$/.test(v.trim());
                const diff = !bad && v.trim() !== "" ? Number(v) - r.stock : 0;
                return (
                  <tr key={r.sku} className="border-t border-black/10">
                    <td className="px-3 py-2">{r.product} {!r.active && <Badge tone="gray">Ẩn</Badge>}</td>
                    <td className="px-3 py-2"><code className="text-xs">{r.sku}</code></td>
                    <td className="px-3 py-2">{r.variant}</td>
                    <td className="px-3 py-2 font-bold">{r.stock === 0 ? <Badge tone="red">Hết hàng</Badge> : r.stock}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <input aria-label={`Tồn mới của ${r.sku}`} inputMode="numeric" value={v} onChange={(e) => setEdit((s) => ({ ...s, [r.sku]: e.target.value }))} placeholder={String(r.stock)} aria-invalid={bad} className={`${inputCls} !h-9 !w-24 ${bad ? "!border-red-600" : ""}`} />
                        {diff !== 0 && <span className={`text-xs font-bold ${diff > 0 ? "text-green-700" : "text-red-600"}`}>{diff > 0 ? "+" : ""}{diff}</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
            <div className="mt-4 flex flex-col gap-3 border-t border-black/10 pt-4 sm:flex-row sm:items-center">
              <input aria-label="Ghi chú" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (vd: Kiểm kho cuối tháng, nhập hàng đợt 2…)" className={`${inputCls} sm:max-w-[460px]`} />
              <button type="button" onClick={save} disabled={busy || !changes.length || invalid > 0} className={`${btn.primary} disabled:opacity-40`}>{busy ? "Đang lưu…" : `Lưu ${changes.length} thay đổi`}</button>
              {changes.length > 0 && <button type="button" onClick={() => setEdit({})} className="text-sm underline">Bỏ thay đổi</button>}
            </div>
            {invalid > 0 && <p role="alert" className="mt-2 text-sm text-red-600">Có {invalid} ô chưa hợp lệ: chỉ nhập số nguyên từ 0 trở lên.</p>}
            {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-2 text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
          </>
        ) : (
          <Table head={["Thời gian", "Sản phẩm", "SKU", "Thay đổi", "Lý do", "Đơn / ghi chú"]} empty={shownMoves.length ? undefined : "Chưa có biến động nào."}>
            {shownMoves.map((m) => (
              <tr key={m.id} className="border-t border-black/10">
                <td className="whitespace-nowrap px-3 py-2">{when(m.at)}</td>
                <td className="px-3 py-2">{m.product}</td>
                <td className="px-3 py-2"><code className="text-xs">{m.sku}</code></td>
                <td className={`px-3 py-2 font-bold ${m.delta > 0 ? "text-green-700" : "text-red-600"}`}>{m.delta > 0 ? "+" : ""}{m.delta}</td>
                <td className="px-3 py-2">{REASON[m.reason]}</td>
                <td className="px-3 py-2 text-xs">{m.orderNumber || m.note || "—"}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
