"use server";

import { getCatalog, hrefOf, toCard } from "@/lib/storefront";
import type { CartLine, CartProductInfo, CouponQuote, PlaceOrderInput, PlaceOrderResult } from "@/lib/checkout";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const SKU = /^[A-Za-z0-9._-]{1,64}$/;

/** Lấy lại thông tin hiển thị (tên, ảnh, giá, còn hàng) cho các SKU trong giỏ. SKU không còn bán sẽ không có trong kết quả. */
export async function lookupCartItems(skus: string[]): Promise<Record<string, CartProductInfo>> {
  const want = new Set(skus.filter((s) => typeof s === "string" && SKU.test(s)).slice(0, 100));
  const out: Record<string, CartProductInfo> = {};
  if (!want.size) return out;
  const { products } = await getCatalog();
  for (const p of products) {
    const card = toCard(p);
    const info: CartProductInfo = { productId: p.id, name: p.name, image: card.image, href: hrefOf(p), variants: p.variants };
    for (const v of p.variants) if (want.has(v.id)) out[v.id] = info;
  }
  return out;
}

/** id khách hàng của tài khoản đang đăng nhập (admin cũng chỉ lấy hồ sơ của chính mình, không dùng select customers vì admin đọc được cả bảng). */
async function myCustomerId(sb: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data, error } = await sb.rpc("current_customer_id");
  if (error) throw new Error(error.message);
  return (data as string | null) ?? null;
}

/** Xem trước mức giảm của mã ưu đãi (chỉ để hiển thị; `place_order` kiểm tra và tính lại khi đặt hàng). */
export async function quoteCoupon(code: string, subtotal: number): Promise<CouponQuote> {
  const c = String(code ?? "").trim();
  if (!c) return { ok: false, message: "Vui lòng nhập mã ưu đãi." };
  if (!isSupabaseConfigured()) return { ok: false, message: "Chưa kết nối hệ thống, chưa thể áp dụng mã." };
  try {
    const sb = await createClient();
    const { data, error } = await sb.rpc("quote_coupon", { p_code: c.slice(0, 40), p_subtotal: Math.max(0, Math.trunc(subtotal) || 0) });
    if (error) throw new Error(error.message);
    const r = data as { ok?: boolean; code?: string; discount?: number; message?: string } | null;
    if (r?.ok) return { ok: true, code: String(r.code), discount: Number(r.discount) };
    return { ok: false, message: r?.message ?? "Mã ưu đãi không hợp lệ." };
  } catch (e) {
    console.error("[cart] quoteCoupon:", e);
    return { ok: false, message: "Không kiểm tra được mã lúc này. Vui lòng thử lại." };
  }
}

/** Giỏ đã lưu của tài khoản đang đăng nhập. signedIn=false nếu chưa đăng nhập / chưa cấu hình. */
export async function loadMyCart(): Promise<{ signedIn: boolean; lines: CartLine[] }> {
  if (!isSupabaseConfigured()) return { signedIn: false, lines: [] };
  try {
    const sb = await createClient();
    const me = await myCustomerId(sb);
    if (!me) return { signedIn: false, lines: [] };
    const { data } = await sb.from("customer_carts").select("items").eq("customer_id", me).maybeSingle();
    return { signedIn: true, lines: sanitizeLines(data?.items) };
  } catch (e) {
    console.error("[cart] loadMyCart:", e);
    return { signedIn: false, lines: [] };
  }
}

export async function saveMyCart(lines: CartLine[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const sb = await createClient();
    const me = await myCustomerId(sb);
    if (!me) return false;
    const { error } = await sb.from("customer_carts").upsert({ customer_id: me, items: sanitizeLines(lines), updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return true;
  } catch (e) {
    console.error("[cart] saveMyCart:", e);
    return false;
  }
}

function sanitizeLines(x: unknown): CartLine[] {
  if (!Array.isArray(x)) return [];
  const seen = new Set<string>();
  const out: CartLine[] = [];
  for (const r of x as Record<string, unknown>[]) {
    const sku = typeof r?.sku === "string" ? r.sku : "";
    const qty = Math.trunc(Number(r?.qty));
    if (!SKU.test(sku) || seen.has(sku) || !(qty >= 1)) continue;
    seen.add(sku);
    out.push({ sku, qty: Math.min(99, qty), selected: r.selected !== false });
  }
  return out.slice(0, 100);
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Tạo đơn COD. Toàn bộ kiểm tra giá/tồn kho/trừ kho nằm trong hàm SQL `place_order` (một giao dịch). */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!isSupabaseConfigured()) return { ok: false, code: "unconfigured", message: "Hệ thống đặt hàng chưa được kết nối. Vui lòng thử lại sau." };
  const lines = Array.isArray(input?.items) ? input.items.filter((i) => SKU.test(String(i?.sku)) && Number.isInteger(i?.qty)).slice(0, 50) : [];
  if (!lines.length) return { ok: false, code: "empty", message: "Bạn chưa chọn sản phẩm nào để đặt hàng." };

  const other = Boolean(str(input.receiverName, 120) || str(input.receiverPhone, 20));
  const name = str(input.name, 120);
  const phone = str(input.phone, 20);
  const payload = {
    items: lines.map((i) => ({ sku: i.sku, qty: i.qty })),
    expected_total: Number.isFinite(input.expectedTotal) ? Math.trunc(input.expectedTotal) : undefined,
    contact: { name, phone, email: str(input.email, 200) },
    ship: {
      name: other ? str(input.receiverName, 120) : name,
      phone: other ? str(input.receiverPhone, 20) : phone,
      province: str(input.province, 120),
      ward: str(input.district, 120),
      street: str(input.address, 300),
    },
    note: str(input.note, 500),
    coupon_code: str(input.couponCode, 40) || undefined,
    payment_method: "cod",
  };

  try {
    const sb = await createClient();
    const { data, error } = await sb.rpc("place_order", { p: payload });
    if (error) throw new Error(error.message);
    const r = data as Record<string, unknown> | null;
    if (r?.ok === true) {
      return { ok: true, orderNumber: String(r.order_number), subtotal: Number(r.subtotal_vnd), shippingFee: Number(r.shipping_fee_vnd), discount: Number(r.discount_vnd ?? 0), total: Number(r.total_vnd) };
    }
    const code = String(r?.code ?? "error") as Extract<PlaceOrderResult, { ok: false }>["code"];
    return {
      ok: false,
      code,
      message: String(r?.message ?? "Không thể tạo đơn hàng."),
      items: Array.isArray(r?.items) ? (r.items as { sku: string; name?: string; available?: number }[]) : undefined,
      total: r?.total_vnd == null ? undefined : Number(r.total_vnd),
    };
  } catch (e) {
    console.error("[checkout] place_order:", e);
    return { ok: false, code: "error", message: "Có lỗi khi tạo đơn hàng. Vui lòng thử lại sau ít phút." };
  }
}
