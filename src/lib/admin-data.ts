import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CategoryRow, CouponRow, OrderRow, OrderStatus, ProductRow, SizeUnit } from "@/lib/admin-types";

/* Tất cả truy vấn chạy bằng quyền người dùng admin đang đăng nhập (RLS). Gọi sau requireAdmin(). */

export async function listCategories(): Promise<CategoryRow[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("storefront_categories").select("id,parent_id,slug,name,sort_order,min_price_vnd").order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((c) => ({ ...c, min_price_vnd: c.min_price_vnd === null ? null : Number(c.min_price_vnd) }));
}

export async function listProducts(): Promise<ProductRow[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("products")
    .select(
      "id,slug,name,kind,status,is_featured,is_new,category_id,hero_material,short_description,usage_instructions,storage_instructions,warnings,ingredients,suitable_for,region,product_line,shelf_life_months,pao_months,deleted_at,created_at,storefront_categories(name),product_variants(id,sku,size_value,size_unit,price_vnd,stock_qty,is_active,label,is_default),product_images(image_url,sort_order,is_primary,variant_id)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((p) => {
    const cat = p.storefront_categories as unknown as { name: string } | null;
    const allImgs = (p.product_images as { image_url: string; sort_order: number; is_primary: boolean; variant_id: string | null }[]) ?? [];
    const imgs = allImgs.filter((i) => !i.variant_id).sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
    return {
      id: p.id, slug: p.slug, name: p.name, kind: p.kind, status: p.status, is_featured: p.is_featured, is_new: Boolean(p.is_new),
      category_id: p.category_id, category_name: cat?.name ?? "",
      hero_material: p.hero_material ?? "", short_description: p.short_description ?? "", usage_instructions: p.usage_instructions ?? "",
      storage_instructions: p.storage_instructions ?? "", warnings: p.warnings ?? "",
      ingredients: p.ingredients ?? "", suitable_for: p.suitable_for ?? "", region: p.region ?? "", product_line: p.product_line ?? "",
      shelf_life_months: p.shelf_life_months, pao_months: p.pao_months, deleted: p.deleted_at !== null,
      variants: ((p.product_variants as { id: string; sku: string; size_value: string | number; size_unit: SizeUnit; price_vnd: string | number; stock_qty: number; is_active: boolean; label: string | null; is_default: boolean }[]) ?? []).map((v) => ({
        id: v.id, sku: v.sku, size_value: Number(v.size_value), size_unit: v.size_unit, price_vnd: Number(v.price_vnd), stock_qty: v.stock_qty, is_active: v.is_active,
        label: v.label, is_default: v.is_default, images: allImgs.filter((i) => i.variant_id === v.id).sort((a, b) => a.sort_order - b.sort_order).map((i) => i.image_url),
      })),
      images: imgs.map((i) => i.image_url),
    } satisfies ProductRow;
  });
}

export async function listOrders(): Promise<OrderRow[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("orders")
    .select("*, order_items(id,sku,product_name,unit_price_vnd,quantity,line_total_vnd)")
    .order("placed_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []).map((o) => ({
    id: o.id, order_number: o.order_number, placed_at: o.placed_at, status: o.status as OrderStatus,
    payment_method: o.payment_method, payment_status: o.payment_status,
    contact_name: o.contact_name, contact_phone: o.contact_phone, contact_email: o.contact_email,
    ship_name: o.ship_name, ship_phone: o.ship_phone, ship_address: `${o.ship_street}, ${o.ship_ward}, ${o.ship_province}`,
    subtotal_vnd: Number(o.subtotal_vnd), shipping_fee_vnd: Number(o.shipping_fee_vnd), discount_vnd: Number(o.discount_vnd), total_vnd: Number(o.total_vnd),
    coupon_code: o.coupon_code, is_gift: o.is_gift, gift_message: o.gift_message, customer_note: o.customer_note, carrier: o.carrier, tracking_code: o.tracking_code,
    items: ((o.order_items as { id: string; sku: string; product_name: string; unit_price_vnd: string | number; quantity: number; line_total_vnd: string | number }[]) ?? []).map((i) => ({
      id: i.id, sku: i.sku, product_name: i.product_name, unit_price_vnd: Number(i.unit_price_vnd), quantity: i.quantity, line_total_vnd: Number(i.line_total_vnd),
    })),
  }));
}

export async function listCoupons(): Promise<CouponRow[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("coupons").select("*").order("code");
  if (error) throw new Error(error.message);
  const day = (s: string | null) => (s ? s.slice(0, 10) : "");
  return (data ?? []).map((c) => ({
    id: c.code, code: c.code, discount_type: c.discount_type, discount_value: Number(c.discount_value), min_order_vnd: Number(c.min_order_vnd),
    starts_at: day(c.starts_at), ends_at: day(c.ends_at), is_active: c.is_active,
    max_uses: Number(c.max_uses ?? 0), max_discount_vnd: Number(c.max_discount_vnd ?? 0), used_count: Number(c.used_count ?? 0),
  }));
}

export type CustomerRow = { id: string; name: string; email: string; phone: string; joined: string; orders: number; spent: number };
export async function listCustomers(): Promise<CustomerRow[]> {
  const sb = await createClient();
  const [{ data: cs, error }, { data: staff }, { data: os }] = await Promise.all([
    sb.from("customers").select("id,full_name,email,phone,created_at").order("created_at", { ascending: false }).limit(1000),
    sb.from("staff_members").select("work_email"),
    sb.from("orders").select("customer_id,total_vnd,status").not("customer_id", "is", null),
  ]);
  if (error) throw new Error(error.message);
  const staffEmails = new Set((staff ?? []).map((s) => String(s.work_email).toLowerCase()));
  const agg = new Map<string, { n: number; sum: number }>();
  for (const o of os ?? []) {
    const a = agg.get(o.customer_id as string) ?? { n: 0, sum: 0 };
    a.n += 1;
    if (o.status !== "cancelled") a.sum += Number(o.total_vnd);
    agg.set(o.customer_id as string, a);
  }
  return (cs ?? [])
    .filter((c) => !c.email || !staffEmails.has(String(c.email).toLowerCase()))
    .map((c) => ({ id: c.id, name: c.full_name ?? "", email: c.email ?? "", phone: c.phone ?? "", joined: String(c.created_at).slice(0, 10), orders: agg.get(c.id)?.n ?? 0, spent: agg.get(c.id)?.sum ?? 0 }));
}

export type StaffRow = { id: string; name: string; email: string; title: string; status: string };
export async function listStaff(): Promise<StaffRow[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("staff_members").select("id,full_name,work_email,job_title,status").order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map((s) => ({ id: s.id, name: s.full_name, email: String(s.work_email), title: s.job_title ?? "", status: s.status }));
}

/* ───────── Dashboard ───────── */
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

export async function getDashboard() {
  const sb = await createClient();
  const since = new Date(Date.now() - 14 * 86400_000).toISOString();
  const [{ data: recent }, { data: lines }, { data: variants }, { count: customers }, { data: latest }, { count: pendingCount }] = await Promise.all([
    sb.from("orders").select("placed_at,total_vnd,status").gte("placed_at", since),
    sb.from("order_items").select("product_name,quantity,orders!inner(status,placed_at)").gte("orders.placed_at", new Date(Date.now() - 90 * 86400_000).toISOString()).neq("orders.status", "cancelled"),
    sb.from("product_variants").select("sku,stock_qty,products!inner(name,status,deleted_at)").eq("is_active", true).lte("stock_qty", 10).eq("products.status", "active").is("products.deleted_at", null),
    sb.from("customers").select("id", { count: "exact", head: true }),
    sb.from("orders").select("id,order_number,contact_name,total_vnd,status,placed_at").order("placed_at", { ascending: false }).limit(5),
    sb.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const days: { d: string; v: number }[] = [];
  for (let i = 13; i >= 0; i--) days.push({ d: dayKey(new Date(Date.now() - i * 86400_000).toISOString()), v: 0 });
  const idx = new Map(days.map((x, i) => [x.d, i]));
  const byStatus: Record<string, number> = {};
  for (const o of recent ?? []) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    if (o.status === "cancelled") continue;
    const i = idx.get(dayKey(o.placed_at));
    if (i !== undefined) days[i].v += Number(o.total_vnd);
  }
  const top = new Map<string, number>();
  for (const l of lines ?? []) top.set(l.product_name, (top.get(l.product_name) ?? 0) + l.quantity);
  const pending = pendingCount ?? 0;

  return {
    series: days.map((x) => ({ d: x.d.slice(8, 10) + "/" + x.d.slice(5, 7), v: x.v })),
    revenue14: days.reduce((s, x) => s + x.v, 0),
    revenueToday: days[days.length - 1].v,
    orders14: (recent ?? []).length,
    byStatus,
    pending,
    customers: customers ?? 0,
    top: [...top.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, sold]) => ({ name, sold })),
    lowStock: (variants ?? []).map((v) => ({ sku: v.sku, stock: v.stock_qty, name: (v.products as unknown as { name: string }).name })),
    latest: (latest ?? []).map((o) => ({ id: o.id, code: o.order_number, name: o.contact_name, total: Number(o.total_vnd), status: o.status as OrderStatus })),
  };
}

export type StockRow = { sku: string; product: string; variant: string; stock: number; active: boolean };
export type MovementRow = { id: number; at: string; sku: string; product: string; delta: number; reason: "order" | "cancel" | "adjust"; note: string; orderNumber: string };

const sizeLabel = (label: string | null, v: unknown, u: unknown) => label || `${Number(v)} ${u}`;

/** Mọi biến thể (kể cả ngừng bán) của sản phẩm chưa xóa, để nhập/điều chỉnh tồn. */
export async function listStock(): Promise<StockRow[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("products").select("name,status,product_variants(sku,label,size_value,size_unit,stock_qty,is_active)").is("deleted_at", null).order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).flatMap((p) =>
    ((p.product_variants as { sku: string; label: string | null; size_value: number; size_unit: string; stock_qty: number; is_active: boolean }[]) ?? [])
      .sort((a, b) => a.sku.localeCompare(b.sku))
      .map((v) => ({ sku: v.sku, product: p.name, variant: sizeLabel(v.label, v.size_value, v.size_unit), stock: v.stock_qty, active: v.is_active && p.status === "active" })),
  );
}

/** 300 biến động kho gần nhất (đặt hàng, hủy đơn, điều chỉnh). */
export async function listStockMovements(): Promise<MovementRow[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("stock_movements").select("id,delta,reason,note,created_at,product_variants(sku,products(name)),orders(order_number)").order("id", { ascending: false }).limit(300);
  if (error) throw new Error(error.message);
  return (data ?? []).map((m) => {
    const v = m.product_variants as unknown as { sku: string; products: { name: string } | null } | null;
    const o = m.orders as unknown as { order_number: string } | null;
    return { id: Number(m.id), at: String(m.created_at), sku: v?.sku ?? "—", product: v?.products?.name ?? "—", delta: m.delta, reason: m.reason, note: m.note ?? "", orderNumber: o?.order_number ?? "" };
  });
}
