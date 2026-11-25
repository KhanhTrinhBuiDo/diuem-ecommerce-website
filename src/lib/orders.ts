import "server-only";
import { orderStatusLabel, type Order, type OrderItem, type OrderStatus, type OrderStep } from "@/data/account";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCatalog, hrefOf, toCard } from "@/lib/storefront";

type Row = Record<string, unknown>;
const when = (iso: unknown) => {
  if (!iso) return null;
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric", hour12: false }).formatToParts(new Date(String(iso)));
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("hour")}:${g("minute")} ${g("day")}.${g("month")}.${g("year")}`;
};
const PAY: Record<string, string> = { cod: "Thanh toán khi nhận hàng (COD)", vnpay: "VNPay", zalopay: "ZaloPay", momo: "MoMo", bank_transfer: "Chuyển khoản" };

/** Ghép dòng đơn với catalog hiện tại (ảnh, link). Sản phẩm đã ngừng bán vẫn hiển thị theo snapshot trong đơn. */
async function skuIndex() {
  const { products } = await getCatalog();
  const m = new Map<string, { href: string; image: string | null; productId: string; name: string }>();
  for (const p of products) {
    const card = toCard(p);
    for (const v of p.variants) m.set(v.id, { href: hrefOf(p), image: v.images?.[0] ?? card.image, productId: p.id, name: p.name });
  }
  return m;
}

function build(o: Row, items: Row[], idx: Awaited<ReturnType<typeof skuIndex>>): Order {
  const status = String(o.status) as OrderStatus;
  const cancelled = status === "cancelled";
  const steps: OrderStep[] = [
    { key: "placed", label: "Đặt hàng", time: when(o.placed_at) },
    { key: "confirmed", label: "Xác nhận thông tin", time: when(o.confirmed_at) },
    { key: "handed", label: "Đã giao cho ĐVVC", time: when(o.shipped_at) },
    { key: "received", label: "Đã nhận hàng", time: when(o.completed_at) },
  ];
  const lines: OrderItem[] = items.map((i) => {
    const sku = String(i.sku);
    const full = String(i.product_name);
    const cut = full.lastIndexOf(" – ");
    const hit = idx.get(sku);
    return {
      id: `${hit?.productId ?? sku}:${sku}`, sku,
      name: cut > 0 ? full.slice(0, cut) : full,
      variant: cut > 0 ? full.slice(cut + 3) : "",
      qty: Number(i.quantity), price: Number(i.unit_price_vnd),
      image: hit?.image ?? null, href: hit?.href ?? "/san-pham", reviewed: false,
    };
  });
  return {
    id: String(o.order_number), code: String(o.order_number), status,
    items: lines,
    subtotal: Number(o.subtotal_vnd), voucher: Number(o.discount_vnd), shipping: Number(o.shipping_fee_vnd), total: Number(o.total_vnd),
    address: { name: String(o.ship_name), phone: String(o.ship_phone), line: [o.ship_street, o.ship_ward, o.ship_province].filter(Boolean).join(", ") },
    carrier: String(o.carrier ?? "") || "—", trackingCode: String(o.tracking_code ?? "") || "—",
    steps: cancelled ? steps.map((s, i) => (i === 0 ? s : { ...s, time: null })) : steps,
    returnDeadline: null,
    paymentLabel: PAY[String(o.payment_method)] ?? String(o.payment_method),
  };
}

const ORDER_COLS = "id,order_number,status,placed_at,confirmed_at,shipped_at,completed_at,cancelled_at,subtotal_vnd,discount_vnd,shipping_fee_vnd,total_vnd,ship_name,ship_phone,ship_street,ship_ward,ship_province,carrier,tracking_code,payment_method,order_items(sku,product_name,unit_price_vnd,quantity)";

/** Đơn của tài khoản đang đăng nhập. Phải lọc theo customer_id: tài khoản admin đọc được MỌI đơn qua RLS. */
export async function listMyOrders(): Promise<{ signedIn: boolean; orders: Order[] }> {
  if (!isSupabaseConfigured()) return { signedIn: false, orders: [] };
  try {
    const sb = await createClient();
    const { data: me, error: e0 } = await sb.rpc("current_customer_id");
    if (e0) throw new Error(e0.message);
    if (!me) return { signedIn: false, orders: [] };
    const { data, error } = await sb.from("orders").select(ORDER_COLS).eq("customer_id", me).order("placed_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    const idx = await skuIndex();
    return { signedIn: true, orders: (data ?? []).map((o) => build(o as Row, ((o as Row).order_items as Row[]) ?? [], idx)) };
  } catch (e) {
    console.error("[orders] listMyOrders:", e);
    return { signedIn: false, orders: [] };
  }
}

export async function getMyOrder(code: string): Promise<{ signedIn: boolean; order: Order | null }> {
  const r = await listMyOrders();
  return { signedIn: r.signedIn, order: r.orders.find((o) => o.code === code) ?? null };
}

export type LookupResult = { ok: true; order: Order } | { ok: false; code: "not_found" | "invalid" | "rate_limited" | "error" };

/** Tra cứu khách vãng lai qua hàm SQL `lookup_order` (mã đơn + SĐT/email; giới hạn số lần thử sai). */
export async function lookupOrderPublic(code: string, contact: string): Promise<LookupResult> {
  if (!isSupabaseConfigured()) return { ok: false, code: "error" };
  try {
    const sb = await createClient();
    const { data, error } = await sb.rpc("lookup_order", { p_code: code.slice(0, 40), p_contact: contact.slice(0, 200) });
    if (error) throw new Error(error.message);
    const r = data as Row;
    if (r?.ok !== true) return { ok: false, code: (["not_found", "invalid", "rate_limited"].includes(String(r?.code)) ? r.code : "error") as "not_found" };
    return { ok: true, order: build(r.order as Row, (r.items as Row[]) ?? [], await skuIndex()) };
  } catch (e) {
    console.error("[orders] lookup:", e);
    return { ok: false, code: "error" };
  }
}

export { orderStatusLabel };
