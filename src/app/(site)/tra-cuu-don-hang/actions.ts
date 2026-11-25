"use server";

import type { Order } from "@/data/account";
import { lookupOrderPublic } from "@/lib/orders";

export type LookupResponse = { ok: true; order: Order } | { ok: false; message: string };

/** Tra cứu đơn cho khách vãng lai: mã đơn + SĐT/email đặt hàng. Giới hạn số lần thử sai nằm trong hàm SQL `lookup_order`. */
export async function lookupOrderAction(code: string, contact: string): Promise<LookupResponse> {
  const r = await lookupOrderPublic(String(code ?? ""), String(contact ?? ""));
  if (r.ok) return r;
  const message =
    r.code === "rate_limited" ? "Bạn đã thử quá nhiều lần. Vui lòng đợi 15 phút rồi thử lại, hoặc liên hệ Dịu Em."
    : r.code === "error" ? "Không tra cứu được lúc này. Vui lòng thử lại sau."
    : "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn và số điện thoại/email.";
  return { ok: false, message };
}
