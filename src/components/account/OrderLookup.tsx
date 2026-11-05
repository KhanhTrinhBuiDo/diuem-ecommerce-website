"use client";

import { useState } from "react";
import { OrderPanel } from "@/components/account/OrderPanel";
import { lookupOrder, type Order } from "@/data/account";

/**
 * Tra cứu đơn cho khách chưa đăng nhập (Figma "Tra cứu đơn hàng").
 * Dữ liệu mẫu: thử mã 260609JM69BRCU + SĐT 0827745632.
 * TODO(supabase): chuyển thành server action; trả về tối thiểu thông tin; giới hạn số lần thử theo IP.
 */
export function OrderLookup() {
  const [code, setCode] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    if (!code.trim() || !contact.trim()) return setError("Vui lòng nhập mã đơn hàng và số điện thoại/email đặt hàng.");
    const o = lookupOrder(code, contact);
    if (!o) return setError("Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn và số điện thoại/email.");
    setError("");
    setResult(o);
  }
  function reset() {
    setCode("");
    setContact("");
    setResult(null);
    setError("");
  }

  const inp = "h-[62px] w-full rounded-full border border-black bg-white px-6 text-[clamp(14px,1.04vw,18px)] font-extralight placeholder:text-black/70 sm:pl-[50px]";
  return (
    <div className="mx-auto w-full max-w-[1728px] px-6 pb-16 lg:px-[100px]">
      <h1 className="-rotate-[0.26deg] pt-10 text-[clamp(28px,2.55vw,44px)] font-bold leading-tight lg:pt-[50px]">Tra cứu đơn hàng</h1>
      <div aria-hidden="true" className="mt-5 h-[10px] bg-line" />

      <form onSubmit={submit} noValidate className="mx-auto max-w-[1429px] pt-8">
        <div className="grid gap-6 border-b-2 border-[#c4c4c4] pb-6 md:grid-cols-2 md:gap-[50px]">
          <div className="flex flex-col">
            <label htmlFor="lk-code" className="px-4 py-[5px] text-[15px] sm:px-[50px]">Mã đơn hàng:</label>
            <input id="lk-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Mã đơn hàng của bạn" autoComplete="off" className={inp} />
          </div>
          <div className="flex flex-col">
            <label htmlFor="lk-contact" className="px-4 py-[5px] text-[15px] sm:px-[50px]">Số điện thoại/Email đặt hàng:</label>
            <input id="lk-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Số điện thoại/Email của bạn" autoComplete="off" className={inp} />
          </div>
        </div>
        {error && (
          <p role="alert" className="pt-4 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex flex-col justify-end gap-4 pt-6 sm:flex-row sm:gap-[30px]">
          <button type="submit" className="h-[59px] rounded-full bg-black px-[100px] text-[clamp(16px,1.27vw,22px)] font-bold text-white max-sm:px-6">
            Tra cứu
          </button>
          <button type="button" onClick={reset} className="h-[59px] rounded-full bg-black px-[100px] text-[clamp(16px,1.27vw,22px)] font-bold text-white max-sm:px-6">
            Làm mới
          </button>
        </div>
      </form>

      {result && (
        <div className="mx-auto mt-10 max-w-[1429px]">
          <OrderPanel order={result} back={{ label: "Trở lại", onClick: reset }} />
        </div>
      )}
    </div>
  );
}
