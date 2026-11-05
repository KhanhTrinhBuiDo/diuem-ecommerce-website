"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field, TextAreaField } from "@/components/ui/Field";

export type ShippingErrors = Partial<Record<"name" | "phone" | "email" | "province" | "district" | "address" | "agree" | "refund", string>>;

/**
 * Cột trái "Thông tin vận chuyển" (Figma left).
 * TODO(address): Tỉnh/Thành, Quận/Huyện nên là danh sách chọn (API hành chính VN); hiện là ô nhập tay.
 * TODO(policy): nội dung "Các chính sách mua hàng" chờ khách hàng cung cấp.
 * TODO(auth): đã đăng nhập → tự điền từ hồ sơ, lưu địa chỉ.
 */
export function ShippingForm({ errors }: { errors: ShippingErrors }) {
  const [other, setOther] = useState(false);
  const [policy, setPolicy] = useState(false);
  return (
    <section aria-labelledby="ship" className="flex flex-col gap-[25px] px-6 pb-10 pt-[50px] lg:pl-[100px] lg:pr-2.5">
      <div className="flex flex-col gap-[25px]">
        <h2 id="ship" className="text-[clamp(22px,1.85vw,32px)] font-bold leading-tight">
          Thông tin vận chuyển
        </h2>
        <label className="flex items-center gap-2.5 text-[10px] font-extralight leading-3">
          <Checkbox name="agree" defaultChecked aria-describedby={errors.agree ? "agree-err" : undefined} />
          <span>
            Bằng việc ấn nút đặt hàng, bạn xác nhận là đã đọc và hiểu về chính sách bảo mật dữ liệu cá nhân của Dịu Em.{" "}
            <a href="/chinh-sach-bao-mat" className="font-bold underline">
              Tại đây
            </a>
          </span>
        </label>
        {errors.agree && (
          <p id="agree-err" role="alert" className="-mt-4 text-sm text-red-600">
            {errors.agree}
          </p>
        )}
      </div>

      <div className="flex max-w-[754px] flex-col gap-[0px]">
        <Field name="name" label="Họ và tên" placeholder="Nhập họ tên của bạn" autoComplete="name" required error={errors.name} />
        <Field name="phone" label="Số điện thoại" type="tel" placeholder="Nhập số điện thoại" autoComplete="tel" inputMode="tel" required error={errors.phone} />
        <Field name="email" label="Email" type="email" placeholder="Nhập email của bạn" autoComplete="email" error={errors.email} />
        <div className="grid gap-x-2.5 md:grid-cols-2">
          <Field name="province" label="Tỉnh/Thành phố" placeholder="Nhập tỉnh/thành phố" autoComplete="address-level1" required error={errors.province} />
          <Field name="district" label="Quận/Huyện" placeholder="Nhập quận/huyện" autoComplete="address-level2" required error={errors.district} />
        </div>
        <Field name="address" label="Địa chỉ cụ thể" placeholder="Số nhà, tên đường, phường/xã" autoComplete="street-address" required error={errors.address} />
        <TextAreaField name="note" label="Ghi chú đơn hàng (tuỳ chọn)" placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa chỉ chi tiết hơn" />

        <label className="mt-5 flex items-center gap-2.5 text-[15px]">
          <Checkbox checked={other} onChange={(e) => setOther(e.target.checked)} />
          Gọi người khác nhận hàng (nếu có)
        </label>
        {other && (
          <div className="grid gap-x-2.5 md:grid-cols-2">
            <Field name="receiverName" label="Họ và tên" placeholder="Nhập họ tên của người nhận" required />
            <Field name="receiverPhone" label="Số điện thoại" type="tel" placeholder="Nhập SĐT người nhận" inputMode="tel" required />
          </div>
        )}

        <div className="mt-5 border-t-2 border-black py-[5px]">
          <button type="button" aria-expanded={policy} onClick={() => setPolicy((v) => !v)} className="flex w-full items-center gap-2.5 py-1 text-left text-[15px] underline">
            <span aria-hidden="true" className={`inline-block w-6 text-center transition-transform ${policy ? "" : "-rotate-90"}`}>⌄</span>
            Các chính sách mua hàng
          </button>
          {policy && <p className="px-9 py-2 text-sm font-extralight">Nội dung đang cập nhật.</p>}
        </div>
      </div>
    </section>
  );
}
