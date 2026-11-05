"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { orderNext, type ActionResult, type CategoryRow, type CouponRow, type OrderStatus, type ProductInput } from "@/lib/admin-types";
import { validateCategory, validateCoupon, validateProduct } from "@/lib/admin-validate";
import { createClient } from "@/lib/supabase/server";

/**
 * Mọi thao tác ghi của admin. Mỗi action: (1) requireAdmin() ở server, (2) validate dữ liệu, (3) ghi bằng quyền người dùng
 * → RLS của Supabase là lớp chặn cuối cùng. Không tin bất cứ gì từ trình duyệt.
 */

const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });
function dbError(e: { code?: string; message: string }): string {
  if (e.code === "23505") return "Dữ liệu bị trùng (slug, SKU hoặc mã đã tồn tại).";
  if (e.code === "23503") return "Mục này đang được sử dụng ở nơi khác nên không thể thực hiện.";
  if (e.code === "42501") return "Bạn không có quyền thực hiện thao tác này.";
  return "Không thể lưu. Vui lòng thử lại.";
}
const nz = (s: string) => (s.trim() === "" ? null : s.trim());

/* ───────── Sản phẩm ───────── */
export async function saveProduct(input: ProductInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const err = validateProduct(input);
  if (err) return fail(err);
  const sb = await createClient();

  const row = {
    category_id: input.category_id, slug: input.slug.trim(), name: input.name.trim(), kind: input.kind, status: input.status, is_featured: input.is_featured,
    hero_material: nz(input.hero_material), short_description: nz(input.short_description), usage_instructions: nz(input.usage_instructions),
    storage_instructions: nz(input.storage_instructions), warnings: nz(input.warnings), shelf_life_months: input.shelf_life_months, pao_months: input.pao_months,
  };

  let id = input.id;
  if (id) {
    const { error } = await sb.from("products").update(row).eq("id", id);
    if (error) return fail(dbError(error));
  } else {
    const { data, error } = await sb.from("products").insert(row).select("id").single();
    if (error) return fail(dbError(error));
    id = data.id as string;
  }

  // Phiên bản: cập nhật/ thêm; phiên bản bị bỏ → tắt (không xóa vì đơn cũ còn tham chiếu)
  const { data: existing } = await sb.from("product_variants").select("id").eq("product_id", id);
  const keep = new Set<string>();
  for (const v of input.variants) {
    const vr = { sku: v.sku.trim(), size_value: v.size_value, size_unit: v.size_unit, price_vnd: v.price_vnd, stock_qty: v.stock_qty, is_active: v.is_active };
    if (v.id) {
      keep.add(v.id);
      const { error } = await sb.from("product_variants").update(vr).eq("id", v.id).eq("product_id", id);
      if (error) return fail(dbError(error));
    } else {
      const { error } = await sb.from("product_variants").insert({ ...vr, product_id: id });
      if (error) return fail(dbError(error));
    }
  }
  const drop = (existing ?? []).map((e) => e.id as string).filter((x) => !keep.has(x));
  if (drop.length) await sb.from("product_variants").update({ is_active: false }).in("id", drop);

  // Ảnh: thay toàn bộ danh sách link (ảnh đầu = ảnh chính)
  await sb.from("product_images").delete().eq("product_id", id);
  if (input.images.length) {
    const { error } = await sb.from("product_images").insert(input.images.map((image_url, i) => ({ product_id: id, image_url, sort_order: i, is_primary: i === 0 })));
    if (error) return fail(dbError(error));
  }
  return { ok: true, id: id! };
}

/** Xóa mềm / khôi phục sản phẩm (đặt deleted_at). Không xóa vĩnh viễn. */
export async function setProductDeleted(id: string, deleted: boolean): Promise<ActionResult> {
  await requireAdmin();
  const sb = await createClient();
  const { error } = await sb.from("products").update({ deleted_at: deleted ? new Date().toISOString() : null }).eq("id", id);
  return error ? fail(dbError(error)) : { ok: true };
}

/* ───────── Đơn hàng ───────── */
export async function updateOrder(id: string, patch: { status?: OrderStatus; carrier?: string; tracking_code?: string }): Promise<ActionResult> {
  await requireAdmin();
  const sb = await createClient();
  const { data: cur, error: e0 } = await sb.from("orders").select("status").eq("id", id).single();
  if (e0 || !cur) return fail("Không tìm thấy đơn hàng.");
  const update: Record<string, unknown> = {};
  if (patch.status && patch.status !== cur.status) {
    if (!orderNext[cur.status as OrderStatus]?.includes(patch.status)) return fail("Không thể chuyển sang trạng thái này.");
    update.status = patch.status;
  }
  if (patch.carrier !== undefined) update.carrier = nz(patch.carrier);
  if (patch.tracking_code !== undefined) update.tracking_code = nz(patch.tracking_code);
  if (Object.keys(update).length === 0) return { ok: true };
  const { error } = await sb.from("orders").update(update).eq("id", id);
  return error ? fail(dbError(error)) : { ok: true };
}

/* ───────── Voucher ───────── */
export async function saveCoupon(c: CouponRow, isNew: boolean): Promise<ActionResult> {
  await requireAdmin();
  const code = c.code.trim().toUpperCase();
  const err = validateCoupon({ ...c, code });
  if (err) return fail(err);
  const sb = await createClient();
  const row = { discount_type: c.discount_type, discount_value: c.discount_value, min_order_vnd: c.min_order_vnd, starts_at: c.starts_at || null, ends_at: c.ends_at ? `${c.ends_at}T23:59:59+07:00` : null, is_active: c.is_active };
  const { error } = isNew ? await sb.from("coupons").insert({ code, ...row }) : await sb.from("coupons").update(row).eq("code", c.id);
  return error ? fail(dbError(error)) : { ok: true };
}
export async function deleteCoupon(code: string): Promise<ActionResult> {
  await requireAdmin();
  const sb = await createClient();
  const { error } = await sb.from("coupons").delete().eq("code", code);
  return error ? fail(dbError(error)) : { ok: true };
}

/* ───────── Danh mục ───────── */
export async function saveCategory(c: CategoryRow, isNew: boolean): Promise<ActionResult> {
  await requireAdmin();
  const err = validateCategory(c);
  if (err) return fail(err);
  const sb = await createClient();
  const row = { parent_id: c.parent_id || null, slug: c.slug.trim(), name: c.name.trim(), sort_order: c.sort_order, min_price_vnd: c.min_price_vnd };
  const { error } = isNew ? await sb.from("storefront_categories").insert(row) : await sb.from("storefront_categories").update(row).eq("id", c.id);
  return error ? fail(dbError(error)) : { ok: true };
}
export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const sb = await createClient();
  const { count } = await sb.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
  if (count) return fail("Danh mục còn sản phẩm nên không thể xóa.");
  const { error } = await sb.from("storefront_categories").delete().eq("id", id);
  return error ? fail(dbError(error)) : { ok: true };
}
