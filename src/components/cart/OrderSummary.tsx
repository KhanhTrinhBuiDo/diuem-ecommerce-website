"use client";

import Link from "next/link";
import { useState } from "react";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { priceOf, useCart } from "@/components/cart/CartProvider";
import { Checkbox } from "@/components/ui/Checkbox";
import { PinkBar } from "@/components/ui/PinkBar";
import { formatVND } from "@/lib/format";

/** Đơn từ mức này được freeship (theo Figma "Freeship cho đơn từ 300k"). TODO(shipping): phí giao hàng khi dưới mức này. */
export const FREESHIP_FROM = 300000;

const row = "flex items-center justify-between gap-4 border-b border-black py-2 text-[clamp(14px,1.04vw,18px)] font-light";

/**
 * Cột phải (Figma right): Giỏ hàng, mã ưu đãi, chi tiết thanh toán, phương thức thanh toán, nút THANH TOÁN NGAY.
 * Nút nằm trong <form id="checkout"> bên trái nhờ thuộc tính `form`.
 * TODO(voucher): kiểm tra mã ưu đãi trên server (bảng `vouchers`).
 * TODO(payment): tích hợp cổng OnePay nội địa/quốc tế; trạng thái đơn cập nhật qua webhook.
 */
export function OrderSummary({ agreeError }: { agreeError?: string }) {
  const { items, ready, toggleAll, clear } = useCart();
  const [code, setCode] = useState("");
  const [voucherMsg, setVoucherMsg] = useState("");
  const [pay, setPay] = useState<"domestic" | "international">("domestic");

  const selected = items.filter((i) => i.selected);
  const subtotal = selected.reduce((s, i) => s + priceOf(i) * i.qty, 0);
  const discount = 0; // TODO(voucher)
  const shipFree = subtotal >= FREESHIP_FROM;
  const total = Math.max(0, subtotal - discount); // phí ship chưa tính khi dưới mức freeship
  function applyVoucher() {
    // TODO(voucher): gọi server kiểm tra mã
    setVoucherMsg(code.trim() ? "Mã ưu đãi chưa hợp lệ hoặc chưa được kích hoạt." : "Vui lòng nhập mã ưu đãi.");
  }
  const allSelected = items.length > 0 && selected.length === items.length;

  return (
    <section aria-labelledby="cart" className="flex flex-col gap-5 px-6 pb-10 pt-[50px] lg:pl-[50px] lg:pr-[100px]">
      <div className="flex flex-col gap-5">
        <h2 id="cart" className="text-[clamp(28px,2.55vw,44px)] font-bold leading-tight">
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
            className="min-w-0 flex-1 bg-white px-6 text-[clamp(15px,1.04vw,18px)] font-extralight placeholder:text-black/70 lg:pl-[50px]" />
          <button type="button" onClick={applyVoucher} className="bg-black px-6 text-[clamp(15px,1.04vw,18px)] font-bold text-white hover:opacity-80 lg:px-9">
            Áp dụng
          </button>
        </div>
        <p role="status" className="min-h-5 px-4 pt-1 text-sm text-brand lg:px-[50px]">{voucherMsg}</p>
      </div>

      <section aria-labelledby="pay-detail" className="flex flex-col">
        <h3 id="pay-detail" className="mb-2 text-[clamp(22px,1.85vw,32px)] font-bold">Chi tiết thanh toán</h3>
        <dl>
          <div className={row}><dt>Tạm tính</dt><dd className="font-bold">{formatVND(subtotal)}</dd></div>
          <div className={row}><dt>Voucher ưu đãi</dt><dd className="font-bold">{formatVND(discount)}</dd></div>
          <div className={row}><dt>Phí giao hàng</dt><dd className="font-bold">{!selected.length || shipFree ? "Miễn phí" : "Tính khi giao"}</dd></div>
          <div className={row}><dt>Thành tiền</dt><dd className="font-bold">{formatVND(total)}</dd></div>
        </dl>
      </section>

      <fieldset className="flex flex-col">
        <legend className="mb-2 text-[clamp(22px,1.85vw,32px)] font-bold">Phương thức thanh toán</legend>
        {([["domestic", "Cổng thanh toán nội địa OnePay"], ["international", "Cổng thanh toán quốc tế OnePay"]] as const).map(([v, label]) => (
          <label key={v} className={`${row} cursor-pointer justify-start gap-3`}>
            <input type="radio" name="payment" form="checkout" value={v} checked={pay === v} onChange={() => setPay(v)} className="size-5 accent-[#2e54ff]" />
            {label}
          </label>
        ))}
      </fieldset>

      <label className="flex items-center gap-2.5 text-[10px] font-extralight">
        <Checkbox name="refundPolicy" form="checkout" defaultChecked />
        Tôi đã đọc và đồng ý với chính sách đổi trả
      </label>
      {agreeError && <p role="alert" className="text-sm text-red-600">{agreeError}</p>}

      <button type="submit" form="checkout" disabled={!selected.length} className="h-[52px] w-full rounded-full bg-black text-[clamp(16px,1.27vw,22px)] font-bold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40">
        THANH TOÁN NGAY
      </button>
    </section>
  );
}
