"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAuthModal } from "@/components/auth/AuthProvider";
import { isOrderable, priceOf, useCart } from "@/components/cart/CartProvider";
import { OrderSummary, type AppliedCoupon } from "@/components/cart/OrderSummary";
import { ShippingForm, type ShippingErrors } from "@/components/cart/ShippingForm";
import { placeOrder } from "@/app/(site)/gio-hang/actions";
import { getCheckoutDefaults } from "@/app/(site)/tai-khoan/actions";
import { shippingFee, type PlaceOrderResult } from "@/lib/checkout";
import { formatVND } from "@/lib/format";

type Placed = Extract<PlaceOrderResult, { ok: true }> & { phone: string };

/**
 * Trang Giỏ hàng + Thanh toán (Figma "Cart"): 2 cột – trái vận chuyển, phải giỏ hàng & thanh toán.
 * "THANH TOÁN NGAY" → server action `placeOrder` → hàm SQL `place_order` (tính lại giá, kiểm tra + trừ tồn kho, tạo đơn COD).
 * TODO(payment): cổng thanh toán online (OnePay) – hiện chỉ COD.
 */
export function CartPage() {
  const { items, removeMany, refresh, notice, clearNotice, ready } = useCart();
  const { user } = useAuthModal();
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [pref, setPref] = useState<Awaited<ReturnType<typeof getCheckoutDefaults>>>(null);
  const [placed, setPlaced] = useState<Placed | null>(null);

  // Đăng nhập: tự điền hồ sơ + địa chỉ mặc định
  const uid = user?.id;
  useEffect(() => {
    if (!uid) { setPref(null); return; }
    let alive = true;
    getCheckoutDefaults().then((d) => alive && setPref(d)).catch(() => {});
    return () => { alive = false; };
  }, [uid]);

  // Mỗi lần mở trang giỏ: đối chiếu giá/tồn kho với catalog (kể cả sau "Mua lại" từ đơn cũ)
  useEffect(() => {
    if (ready) void refresh();
  }, [ready, refresh]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const err: ShippingErrors = {};
    if (!v("name")) err.name = "Vui lòng nhập họ tên.";
    if (!/^(\+?84|0)\d{9}$/.test(v("phone").replace(/[\s.-]/g, ""))) err.phone = "Số điện thoại chưa đúng.";
    if (v("email") && !/^\S+@\S+\.\S+$/.test(v("email"))) err.email = "Email chưa đúng.";
    if (!v("province")) err.province = "Vui lòng nhập tỉnh/thành phố.";
    if (!v("district")) err.district = "Vui lòng nhập quận/huyện.";
    if (!v("address")) err.address = "Vui lòng nhập địa chỉ cụ thể.";
    if (!f.get("agree")) err.agree = "Bạn cần đồng ý chính sách bảo mật để đặt hàng.";
    if (!f.get("refundPolicy")) err.refund = "Bạn cần đồng ý chính sách đổi trả để thanh toán.";
    setErrors(err);
    setSubmitError("");
    if (Object.keys(err).length) {
      document.getElementById(`f-${Object.keys(err)[0]}`)?.focus();
      return;
    }

    const lines = items.filter(isOrderable);
    if (!lines.length) {
      setSubmitError("Chưa có sản phẩm còn hàng nào được chọn để đặt.");
      return;
    }
    const subtotal = lines.reduce((s, i) => s + priceOf(i) * i.qty, 0);
    const qtyAll = lines.reduce((s, i) => s + i.qty, 0);
    const clientDisc = Math.min(coupon?.discount ?? 0, subtotal);
    setSubmitting(true);
    try {
      const res = await placeOrder({
        items: lines.map((i) => ({ sku: i.variantId, qty: i.qty })),
        expectedTotal: subtotal - clientDisc + shippingFee(qtyAll),
        couponCode: coupon?.code,
        name: v("name"), phone: v("phone"), email: v("email"),
        province: v("province"), district: v("district"), address: v("address"), note: v("note"),
        receiverName: v("receiverName"), receiverPhone: v("receiverPhone"),
      });
      if (res.ok) {
        removeMany(lines.map((i) => i.key));
        setCoupon(null);
        setPlaced({ ...res, phone: v("phone") });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      // Giá/kho đã đổi: nạp lại giỏ để khách thấy số mới, kèm lời giải thích cụ thể
      if (res.code === "out_of_stock") {
        const names = (res.items ?? []).map((i) => `${i.name ?? i.sku} (còn ${i.available ?? 0})`).join("; ");
        setSubmitError(`${res.message} ${names}. Vui lòng giảm số lượng hoặc bỏ sản phẩm đó.`);
        await refresh();
      } else if (res.code === "price_changed") {
        const sv = res.server;
        const detail = sv
          ? ` Máy chủ tính: hàng ${formatVND(sv.subtotal)} − giảm ${formatVND(sv.discount)} + ship ${formatVND(sv.shippingFee)}; trên màn hình: hàng ${formatVND(subtotal)} − giảm ${formatVND(clientDisc)} + ship ${formatVND(shippingFee(qtyAll))}.`
          : "";
        setSubmitError(`${res.message}${res.total ? ` Tổng mới: ${formatVND(res.total)}.` : ""}${detail}`);
        await refresh();
      } else if (res.code === "coupon_invalid") {
        setCoupon(null);
        setSubmitError(`${res.message} Mã đã được gỡ khỏi đơn, bạn có thể đặt lại.`);
      } else if (res.code === "unavailable") {
        setSubmitError(res.message);
        await refresh();
      } else {
        setSubmitError(res.message);
      }
    } catch {
      setSubmitError("Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <section aria-labelledby="done" className="mx-auto flex w-full max-w-[860px] flex-col items-center gap-6 px-6 py-16 text-center">
        <h2 id="done" className="text-[clamp(26px,calc(var(--vw)*2.4),40px)] font-bold">Đặt hàng thành công</h2>
        <p className="font-light">
          Mã đơn hàng của bạn: <strong className="font-bold text-brand">{placed.orderNumber}</strong>
        </p>
        <dl className="w-full max-w-[520px] text-left text-[clamp(14px,calc(var(--vw)*1.04),18px)] font-light">
          <div className="flex justify-between border-b border-black py-2"><dt>Tạm tính</dt><dd className="font-bold">{formatVND(placed.subtotal)}</dd></div>
          <div className="flex justify-between border-b border-black py-2"><dt>Phí giao hàng</dt><dd className="font-bold">{placed.shippingFee ? formatVND(placed.shippingFee) : "Miễn phí"}</dd></div>
          {placed.discount > 0 && <div className="flex justify-between border-b border-black py-2"><dt>Ưu đãi</dt><dd className="font-bold">-{formatVND(placed.discount)}</dd></div>}
          <div className="flex justify-between border-b border-black py-2"><dt>Thanh toán khi nhận hàng</dt><dd className="font-bold">{formatVND(placed.total)}</dd></div>
        </dl>
        <p className="max-w-[560px] font-extralight">
          Dịu Em sẽ liên hệ qua số {placed.phone} để xác nhận đơn. Bạn thanh toán bằng tiền mặt khi nhận hàng. Vui lòng lưu lại mã đơn để tra cứu.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/san-pham" className="rounded-full bg-black px-8 py-3 font-bold text-white hover:opacity-80">Tiếp tục mua sắm</Link>
          <button type="button" onClick={() => setPlaced(null)} className="rounded-full border-2 border-black px-8 py-3 font-bold hover:bg-black hover:text-white">
            Về giỏ hàng
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {notice && (
        <div role="status" className="mx-auto flex w-full max-w-[1728px] items-start justify-between gap-4 bg-[#ffe3f1] px-6 py-3 text-sm lg:px-[100px]">
          <p>{notice}</p>
          <button type="button" onClick={clearNotice} className="font-bold underline">Đóng</button>
        </div>
      )}
      <form id="checkout" onSubmit={onSubmit} noValidate className="mx-auto grid w-full max-w-[1728px] grid-cols-[minmax(0,1fr)] lg:grid-cols-2">
        <ShippingForm
          key={`${user?.id ?? "guest"}-${pref ? "p" : "n"}`}
          errors={errors}
          defaults={{
            name: pref?.name || (user?.name && user.name !== user.email ? user.name : ""),
            email: pref?.email || user?.email || "",
            phone: pref?.phone || pref?.address?.phone || "",
            province: pref?.address?.province, district: pref?.address?.district, address: pref?.address?.street,
          }}
        />
        <OrderSummary agreeError={errors.refund} submitError={submitError} submitting={submitting} coupon={coupon} onCoupon={setCoupon} />
      </form>
    </>
  );
}
