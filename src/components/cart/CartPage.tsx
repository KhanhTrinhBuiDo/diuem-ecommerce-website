"use client";

import { useState, type FormEvent } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { ShippingForm, type ShippingErrors } from "@/components/cart/ShippingForm";

/**
 * Trang Giỏ hàng + Thanh toán (Figma "Cart"): 2 cột – trái vận chuyển, phải giỏ hàng & thanh toán.
 * PLACEHOLDER: "THANH TOÁN NGAY" mới kiểm tra form, chưa tạo đơn/chuyển sang cổng thanh toán.
 * TODO(checkout): tạo đơn ở server (tính lại giá từ DB, kiểm tra tồn kho) → trả URL OnePay → webhook cập nhật trạng thái.
 */
export function CartPage() {
  const { items } = useCart();
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    setDone(Object.keys(err).length === 0 && items.some((i) => i.selected));
    if (Object.keys(err).length) document.getElementById(`f-${Object.keys(err)[0]}`)?.focus();
  }

  return (
    <form id="checkout" onSubmit={onSubmit} noValidate className="mx-auto grid w-full max-w-[1728px] grid-cols-[minmax(0,1fr)] lg:grid-cols-2">
      <ShippingForm errors={errors} />
      <div>
        <OrderSummary agreeError={errors.refund} />
        {done && (
          <p role="status" className="px-6 pb-8 text-sm text-brand lg:pl-[50px] lg:pr-[100px]">
            Thông tin hợp lệ. Cổng thanh toán OnePay sẽ được kết nối ở bước sau nên chưa tạo đơn hàng.
          </p>
        )}
      </div>
    </form>
  );
}
