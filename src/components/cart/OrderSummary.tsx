"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { listMyVouchers, quoteCoupon } from "@/app/(site)/gio-hang/actions";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { isOrderable, priceOf, useCart } from "@/components/cart/CartProvider";
import { Checkbox } from "@/components/ui/Checkbox";
import { PinkBar } from "@/components/ui/PinkBar";
import { FREESHIP_MIN_QTY, shippingFee, type MyVoucher } from "@/lib/checkout";
import { formatVND } from "@/lib/format";

/** Đơn từ mức này được freeship (theo Figma "Freeship cho đơn từ 300k"). */

const row = "flex items-center justify-between gap-4 border-b border-black py-2 text-[clamp(14px,calc(var(--vw)*1.04),18px)] font-light";

/**
 * Cột phải (Figma right): Giỏ hàng, mã ưu đãi, chi tiết thanh toán, phương thức thanh toán, nút THANH TOÁN NGAY.
 * Nút nằm trong <form id="checkout"> bên trái nhờ thuộc tính `form`.
 * Mã ưu đãi: xem trước qua `quoteCoupon`; `place_order` kiểm tra và tính lại khi đặt hàng.
 * Hiện chỉ thanh toán khi nhận hàng (COD). TODO(payment): OnePay nội địa/quốc tế + webhook cập nhật trạng thái.
 */
export type AppliedCoupon = { code: string; discount: number };

export function OrderSummary({
  agreeError, submitError, submitting, coupon, onCoupon,
}: { agreeError?: string; submitError?: string; submitting?: boolean; coupon: AppliedCoupon | null; onCoupon: (c: AppliedCoupon | null) => void }) {
  const { items, ready, toggleAll, clear } = useCart();
  const [code, setCode] = useState("");
  const [voucherMsg, setVoucherMsg] = useState("");

  // Chỉ tính các dòng được chọn VÀ còn hàng
  const selected = items.filter(isOrderable);
  const subtotal = selected.reduce((s, i) => s + priceOf(i) * i.qty, 0);
  const qty = selected.reduce((s, i) => s + i.qty, 0);
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const fee = selected.length ? shippingFee(qty) : 0;
  const total = Math.max(0, subtotal - discount) + fee;
  const [checking, setChecking] = useState(false);
  async function applyVoucher() {
    if (!code.trim()) return setVoucherMsg("Vui lòng nhập mã ưu đãi.");
    if (!subtotal) return setVoucherMsg("Hãy chọn sản phẩm còn hàng trước khi áp dụng mã.");
    setChecking(true);
    const r = await quoteCoupon(code, subtotal, qty).catch(() => ({ ok: false as const, message: "Không kết nối được máy chủ." }));
    setChecking(false);
    if (r.ok) {
      onCoupon({ code: r.code, discount: r.discount });
      setVoucherMsg(`Đã áp dụng mã ${r.code}: giảm ${formatVND(r.discount)}.`);
      setCode("");
    } else {
      onCoupon(null);
      setVoucherMsg(r.message);
    }
  }
  // Giỏ đổi (số lượng, bỏ chọn…) → tính lại mức giảm; không còn đủ điều kiện thì gỡ mã
  const appliedCode = coupon?.code;
  useEffect(() => {
    if (!appliedCode) return;
    let alive = true;
    if (!subtotal) { onCoupon(null); return; }
    void quoteCoupon(appliedCode, subtotal, qty).then((r) => {
      if (!alive) return;
      if (r.ok) onCoupon({ code: r.code, discount: r.discount });
      else { onCoupon(null); setVoucherMsg(`Mã ${appliedCode} đã được gỡ: ${r.message}`); }
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, qty, appliedCode]);

  // Voucher cấp riêng cho tài khoản: hiển thị để chọn; loại "tự động áp dụng" được gắn sẵn trừ khi khách đã gỡ.
  const [mine, setMine] = useState<MyVoucher[]>([]);
  const autoDismissed = useRef(false);
  useEffect(() => {
    if (!ready || !subtotal) { setMine([]); return; }
    let alive = true;
    void listMyVouchers(subtotal, qty).then((list) => {
      if (!alive) return;
      setMine(list);
      if (!coupon && !autoDismissed.current) {
        const best = list.filter((v) => v.auto && v.ok).sort((a, b) => b.discount - a.discount)[0];
        if (best) { onCoupon({ code: best.code, discount: best.discount }); setVoucherMsg(`Đã tự động áp dụng "${best.title}": giảm ${formatVND(best.discount)}.`); }
      }
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, subtotal, qty]);
  const allSelected = items.length > 0 && selected.length === items.length;

  return (
    <section aria-labelledby="cart" className="flex flex-col gap-5 px-6 pb-10 pt-[50px] lg:pl-[50px] lg:pr-[100px]">
      <div className="flex flex-col gap-5">
        <h2 id="cart" className="text-[clamp(28px,calc(var(--vw)*2.55),44px)] font-bold leading-tight">
          Giỏ hàng
        </h2>
        <div className="flex items-center justify-between gap-2.5">
          <label className="flex items-center gap-2.5 text-[15px] font-extralight">
            <Checkbox checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} disabled={!items.length} />
            Tất cả sản phẩm
          </label>
          <button type="button" onClick={clear} disabled={!items.length} className="text-[15px] font-extralight underline hover:text-brand disabled:opacity-40">
            Xóa tất cả
          </button>
        </div>
      </div>
      <PinkBar className="!h-2.5" />

      {!ready ? (
        <p className="py-10 text-center font-extralight">Đang tải giỏ hàng…</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="font-light">Giỏ hàng của bạn đang trống.</p>
          <Link href="/san-pham" className="rounded-full bg-black px-8 py-3 font-bold text-white hover:opacity-80">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-5">
          {items.map((i) => (
            <CartItemRow key={i.key} item={i} />
          ))}
        </ul>
      )}
      <PinkBar className="!h-2.5" />

      {/* Không dùng <form> lồng trong form thanh toán */}
      <div className="flex flex-col">
        <label htmlFor="voucher" className="px-4 py-[5px] text-[15px] lg:px-[50px]">
          Nhập mã ưu đãi
        </label>
        <div className="flex h-[52px] overflow-hidden rounded-full border border-black">
          <input
            id="voucher"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyVoucher();
              }
            }} placeholder="Nhập mã ưu đãi của bạn"
            className="min-w-0 flex-1 bg-white px-6 text-[clamp(15px,calc(var(--vw)*1.04),18px)] font-extralight placeholder:text-black/70 lg:pl-[50px]" />
          <button type="button" onClick={applyVoucher} disabled={checking} className="bg-black disabled:opacity-50 px-6 text-[clamp(15px,calc(var(--vw)*1.04),18px)] font-bold text-white hover:opacity-80 lg:px-9">
            Áp dụng
          </button>
        </div>
        <p role="status" className="min-h-5 px-4 pt-1 text-sm text-brand lg:px-[50px]">
          {voucherMsg}
          {coupon && (
            <button type="button" onClick={() => { autoDismissed.current = true; onCoupon(null); setVoucherMsg(""); }} className="ml-3 text-black underline">Gỡ mã</button>
          )}
        </p>
      </div>

      {mine.length > 0 && (
        <section aria-labelledby="my-vouchers" className="flex flex-col gap-2">
          <h3 id="my-vouchers" className="px-4 text-[15px] lg:px-[50px]">Voucher của bạn</h3>
          <ul className="flex flex-col gap-2">
            {mine.map((v) => {
              const active = coupon?.code === v.code;
              return (
                <li key={v.code}>
                  <button type="button" disabled={!v.ok && !active}
                    onClick={() => { if (active) { autoDismissed.current = true; onCoupon(null); setVoucherMsg(""); } else { onCoupon({ code: v.code, discount: v.discount }); setVoucherMsg(`Đã áp dụng "${v.title}": giảm ${formatVND(v.discount)}.`); } }}
                    className={`flex w-full items-center justify-between gap-3 rounded-[10px] border px-4 py-2 text-left text-sm ${active ? "border-black bg-black text-white" : "border-black/40"} disabled:cursor-not-allowed disabled:opacity-50`}>
                    <span className="flex min-w-0 flex-col">
                      <b className="truncate">{v.title} <span className="font-light">· còn {v.remaining} lượt</span></b>
                      <span className="font-extralight">{v.ok || active ? (v.description ?? "") : v.message}</span>
                    </span>
                    <span className="shrink-0 font-bold">{v.percent ? `-${v.percent}%` : v.fixed ? `-${formatVND(v.fixed)}` : ""}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="pay-detail" className="flex flex-col">
        <h3 id="pay-detail" className="mb-2 text-[clamp(22px,calc(var(--vw)*1.85),32px)] font-bold">Chi tiết thanh toán</h3>
        <dl>
          <div className={row}><dt>Tạm tính</dt><dd className="font-bold">{formatVND(subtotal)}</dd></div>
          <div className={row}><dt>Voucher ưu đãi</dt><dd className="font-bold">{formatVND(discount)}</dd></div>
          <div className={row}><dt>Phí giao hàng</dt><dd className="font-bold">{!selected.length || fee === 0 ? "Miễn phí" : formatVND(fee)}</dd></div>
          {selected.length > 0 && fee > 0 && <p className="text-sm font-extralight">Mua từ {FREESHIP_MIN_QTY} món để được miễn phí vận chuyển.</p>}
          <div className={row}><dt>Thành tiền</dt><dd className="font-bold">{formatVND(total)}</dd></div>
        </dl>
      </section>

      <fieldset className="flex flex-col">
        <legend className="mb-2 text-[clamp(22px,calc(var(--vw)*1.85),32px)] font-bold">Phương thức thanh toán</legend>
        <label className={`${row} cursor-pointer justify-start gap-3`}>
          <input type="radio" name="payment" form="checkout" value="cod" defaultChecked className="size-5 accent-[#2e54ff]" />
          Thanh toán khi nhận hàng (COD)
        </label>
        {/* TODO(payment): mở lại khi tích hợp OnePay */}
        {["Cổng thanh toán nội địa OnePay", "Cổng thanh toán quốc tế OnePay"].map((label) => (
          <label key={label} className={`${row} justify-start gap-3 opacity-40`}>
            <input type="radio" name="payment" form="checkout" disabled className="size-5" />
            {label} <span className="text-xs">(sắp ra mắt)</span>
          </label>
        ))}
      </fieldset>

      <label className="flex items-center gap-2.5 text-[10px] font-extralight">
        <Checkbox name="refundPolicy" form="checkout" defaultChecked />
        Tôi đã đọc và đồng ý với chính sách đổi trả
      </label>
      {agreeError && <p role="alert" className="text-sm text-red-600">{agreeError}</p>}

      {submitError && <p role="alert" className="text-sm text-red-600">{submitError}</p>}

      <button type="submit" form="checkout" disabled={!selected.length || submitting} className="h-[52px] w-full rounded-full bg-black text-[clamp(16px,calc(var(--vw)*1.27),22px)] font-bold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40">
        {submitting ? "ĐANG XỬ LÝ…" : "ĐẶT HÀNG"}
      </button>
    </section>
  );
}
