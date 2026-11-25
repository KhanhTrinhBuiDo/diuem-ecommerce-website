"use client";

import { useState } from "react";
import { OrderPanel } from "@/components/account/OrderPanel";
import { lookupOrderAction } from "@/app/(site)/tra-cuu-don-hang/actions";
import type { Order } from "@/data/account";

/**
 * Tra cứu đơn cho khách chưa đăng nhập (Figma "Tra cứu đơn hàng").
 * Gọi server action → hàm SQL `lookup_order` (mã đơn + SĐT/email; khóa tạm khi thử sai nhiều lần).
 * TODO(captcha): thêm captcha / giới hạn theo IP nếu bị dò mã.
 */
export function OrderLookup() {
  const [code, setCode] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setResult(null);
    if (!code.trim() || !contact.trim()) return setError("Vui lòng nhập mã đơn hàng và số điện thoại/email đặt hàng.");
    setBusy(true);
    try {
      const r = await lookupOrderAction(code, contact);
      if (!r.ok) return setError(r.message);
      setError("");
      setResult(r.order);
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
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
          <button type="submit" disabled={busy} className="h-[59px] rounded-full bg-black px-[100px] text-[clamp(16px,1.27vw,22px)] font-bold text-white max-sm:px-6">
            {busy ? "Đang tra cứu…" : "Tra cứu"}
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
