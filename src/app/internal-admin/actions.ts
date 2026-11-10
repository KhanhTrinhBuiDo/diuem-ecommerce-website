"use server";

import { createHash } from "node:crypto";
import { requireAdmin } from "@/lib/admin-auth";
import { orderNext, type ActionResult, type CategoryRow, type CouponRow, type OrderStatus, type ProductInput } from "@/lib/admin-types";
import { isOwnImage, isSlug, validateCategory, validateCoupon, validateProduct } from "@/lib/admin-validate";
import { createClient } from "@/lib/supabase/server";
import { parseWorkbook, type ParsedProduct } from "@/lib/admin-import";
import { MAX_IMPORT_BYTES, type ImportResponse, type RowError } from "@/lib/admin-import-spec";
import { listCategories } from "@/lib/admin-data";

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

  // Phiên bản: cập nhật/thêm; phiên bản bị bỏ → tắt (không xóa vì đơn cũ còn tham chiếu). Chạy song song cho nhanh.
  const { data: existing } = await sb.from("product_variants").select("id").eq("product_id", id);
  const keep = new Set<string>();
  const ops: PromiseLike<{ error: { code?: string; message: string } | null }>[] = [];
  const toInsert: Record<string, unknown>[] = [];
  for (const v of input.variants) {
    const vr = { sku: v.sku.trim(), size_value: v.size_value, size_unit: v.size_unit, price_vnd: v.price_vnd, stock_qty: v.stock_qty, is_active: v.is_active };
    if (v.id) {
      keep.add(v.id);
      ops.push(sb.from("product_variants").update(vr).eq("id", v.id).eq("product_id", id));
    } else toInsert.push({ ...vr, product_id: id });
  }
  if (toInsert.length) ops.push(sb.from("product_variants").insert(toInsert));
  const drop = (existing ?? []).map((e) => e.id as string).filter((x) => !keep.has(x));
  if (drop.length) ops.push(sb.from("product_variants").update({ is_active: false }).in("id", drop));
  for (const r of await Promise.all(ops)) if (r.error) return fail(dbError(r.error));

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

/* ───────── Nhập sản phẩm hàng loạt từ Excel ───────── */
const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

/**
 * formData: file (.xlsx), commit ("1" = ghi vào DB; khác = chỉ kiểm tra thử).
 * Luôn đọc + kiểm tra lại toàn bộ file ở server; không tin kết quả kiểm tra thử từ trình duyệt.
 */
export async function importProducts(formData: FormData): Promise<ImportResponse> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Hãy chọn file Excel (.xlsx)." };
  if (!file.name.toLowerCase().endsWith(".xlsx")) return { ok: false, error: "Chỉ nhận file .xlsx (tải file mẫu và điền vào)." };
  if (file.size > MAX_IMPORT_BYTES) return { ok: false, error: "File quá lớn (tối đa 3MB)." };
  const commit = formData.get("commit") === "1";
  // Danh sách ảnh cuối cùng theo slug (do màn hình kéo thả gửi lên). Không có → dùng link trong Excel.
  let imageMap: Record<string, string[]> | null = null;
  const rawImages = formData.get("images");
  if (typeof rawImages === "string" && rawImages) {
    try {
      imageMap = JSON.parse(rawImages) as Record<string, string[]>;
    } catch {
      return { ok: false, error: "Dữ liệu ảnh không hợp lệ." };
    }
    const bad = checkImageMap(imageMap);
    if (bad) return { ok: false, error: bad };
  }

  const sb = await createClient();
  const categories = await listCategories();
  const { products, errors } = await parseWorkbook(await file.arrayBuffer(), categories);
  const rowErrors: RowError[] = [...errors];
  if (products.length === 0 || rowErrors.some((e) => e.row === 0 || e.row === 1)) return { ok: false, error: rowErrors[0]?.message ?? "File không hợp lệ.", rowErrors };

  // Đối chiếu với DB: sản phẩm đã có (theo slug) và SKU đã dùng
  const slugs = products.map((p) => p.slug);
  const skus = products.flatMap((p) => p.variants.map((v) => v.sku));
  const [exProducts, exVariants] = await Promise.all([
    Promise.all(chunk(slugs, 100).map((c) => sb.from("products").select("id,slug").in("slug", c))),
    Promise.all(chunk(skus, 100).map((c) => sb.from("product_variants").select("id,sku,product_id").in("sku", c))),
  ]);
  for (const r of [...exProducts, ...exVariants]) if (r.error) return { ok: false, error: dbError(r.error) };
  const prodBySlug = new Map(exProducts.flatMap((r) => r.data ?? []).map((p) => [p.slug as string, p.id as string]));
  const varBySku = new Map(exVariants.flatMap((r) => r.data ?? []).map((v) => [v.sku as string, v as { id: string; sku: string; product_id: string }]));

  for (const p of products) {
    const id = prodBySlug.get(p.slug);
    if (!id) {
      if (!p.category_id) rowErrors.push({ row: p.firstRow, message: `Sản phẩm mới "${p.name}" thiếu Danh mục.` });
      if (!p.short_description) rowErrors.push({ row: p.firstRow, message: `Sản phẩm mới "${p.name}" thiếu Mô tả ngắn.` });
      if (!p.name) rowErrors.push({ row: p.firstRow, message: "Thiếu Tên sản phẩm." });
      if (p.variants.length === 0) rowErrors.push({ row: p.firstRow, message: `Sản phẩm "${p.name}" chưa có phiên bản hợp lệ.` });
    }
    for (const v of p.variants) {
      const hit = varBySku.get(v.sku);
      if (hit && hit.product_id !== id) rowErrors.push({ row: v.row, message: `SKU "${v.sku}" đã thuộc sản phẩm khác.` });
    }
  }
  rowErrors.sort((a, b) => a.row - b.row);
  if (rowErrors.length) return { ok: false, error: `Có ${rowErrors.length} lỗi. Sửa file rồi tải lại.`, rowErrors };

  const existingIds = [...prodBySlug.values()];
  const exImages = existingIds.length
    ? await Promise.all(chunk(existingIds, 100).map((c) => sb.from("product_images").select("product_id,image_url,sort_order").in("product_id", c).order("sort_order")))
    : [];
  const imgsOf = new Map<string, string[]>();
  for (const r of exImages) for (const im of r.data ?? []) imgsOf.set(im.product_id as string, [...(imgsOf.get(im.product_id as string) ?? []), im.image_url as string]);
  const summary = {
    created: products.filter((p) => !prodBySlug.has(p.slug)).length,
    updated: products.filter((p) => prodBySlug.has(p.slug)).length,
    variants: products.reduce((n, p) => n + p.variants.length, 0),
    products: products.map((p) => ({ name: p.name || p.slug, slug: p.slug, isNew: !prodBySlug.has(p.slug), variants: p.variants.length, skus: p.variants.map((v) => v.sku), excelImages: p.images, existingImages: imgsOf.get(prodBySlug.get(p.slug) ?? "") ?? [] })),
  };
  if (!commit) return { ok: true, committed: false, summary };

  // ── Ghi vào DB (PostgREST không có transaction: đã kiểm tra kỹ ở trên để giảm tối đa lỗi giữa chừng)
  const base = (p: ParsedProduct) => {
    const r: Record<string, unknown> = {};
    if (p.name) r.name = p.name;
    if (p.category_id) r.category_id = p.category_id;
    if (p.short_description !== null) r.short_description = p.short_description;
    if (p.status) r.status = p.status;
    if (p.is_featured !== null) r.is_featured = p.is_featured;
    if (p.hero_material !== null) r.hero_material = p.hero_material;
    if (p.usage_instructions !== null) r.usage_instructions = p.usage_instructions;
    if (p.storage_instructions !== null) r.storage_instructions = p.storage_instructions;
    if (p.warnings !== null) r.warnings = p.warnings;
    if (p.shelf_life_months !== null) r.shelf_life_months = p.shelf_life_months;
    if (p.pao_months !== null) r.pao_months = p.pao_months;
    return r;
  };
  const ids = new Map(prodBySlug);
  const fresh = products.filter((p) => !prodBySlug.has(p.slug));
  for (const c of chunk(fresh, 100)) {
    const { data, error } = await sb.from("products").insert(c.map((p) => ({ slug: p.slug, kind: "single", status: "draft", is_featured: false, ...base(p) }))).select("id,slug");
    if (error) return { ok: false, error: `${dbError(error)} (đã dừng khi tạo sản phẩm mới).` };
    for (const d of data ?? []) ids.set(d.slug as string, d.id as string);
  }
  for (const c of chunk(products.filter((p) => prodBySlug.has(p.slug)), 10)) {
    const rs = await Promise.all(c.map((p) => (Object.keys(base(p)).length ? sb.from("products").update(base(p)).eq("id", ids.get(p.slug)!) : Promise.resolve({ error: null }))));
    for (const r of rs) if (r.error) return { ok: false, error: `${dbError(r.error)} (đã dừng khi cập nhật sản phẩm).` };
  }

  const newVars: Record<string, unknown>[] = [];
  const upVars: { id: string; row: Record<string, unknown> }[] = [];
  for (const p of products) {
    for (const v of p.variants) {
      const row: Record<string, unknown> = { sku: v.sku, size_value: v.size_value, size_unit: v.size_unit, price_vnd: v.price_vnd };
      if (v.stock_qty !== null) row.stock_qty = v.stock_qty;
      const hit = varBySku.get(v.sku);
      if (hit) upVars.push({ id: hit.id, row: { ...row, is_active: true } });
      else newVars.push({ ...row, stock_qty: v.stock_qty ?? 0, is_active: true, product_id: ids.get(p.slug) });
    }
  }
  for (const c of chunk(newVars, 200)) {
    const { error } = await sb.from("product_variants").insert(c);
    if (error) return { ok: false, error: `${dbError(error)} (đã dừng khi tạo phiên bản).` };
  }
  for (const c of chunk(upVars, 10)) {
    const rs = await Promise.all(c.map((u) => sb.from("product_variants").update(u.row).eq("id", u.id)));
    for (const r of rs) if (r.error) return { ok: false, error: `${dbError(r.error)} (đã dừng khi cập nhật phiên bản).` };
  }

  // Ảnh: danh sách cuối cùng theo slug (thay toàn bộ; ảnh đầu = ảnh chính)
  const finalImages: Record<string, string[]> = imageMap ?? Object.fromEntries(products.filter((p) => p.images.length).map((p) => [p.slug, p.images]));
  const toSet = Object.entries(finalImages).filter(([slug, urls]) => ids.has(slug) && urls.length > 0);
  const imgErr = await applyImages(sb, toSet.map(([slug, urls]) => ({ id: ids.get(slug)!, urls })));
  if (imgErr) return { ok: false, error: imgErr };
  return { ok: true, committed: true, summary };
}

/** Kiểm tra bản đồ ảnh {slug: [link...]} do trình duyệt gửi lên (không tin dữ liệu client). */
function checkImageMap(m: unknown): string | null {
  if (!m || typeof m !== "object" || Array.isArray(m)) return "Dữ liệu ảnh không hợp lệ.";
  for (const [slug, urls] of Object.entries(m as Record<string, unknown>)) {
    if (!Array.isArray(urls) || urls.length > 10) return `Sản phẩm "${slug}": tối đa 10 ảnh.`;
    for (const u of urls) if (typeof u !== "string" || !isOwnImage(u)) return `Sản phẩm "${slug}": ảnh phải là link Cloudinary của shop.`;
  }
  return null;
}

/** Thay toàn bộ ảnh của các sản phẩm (ảnh đầu = ảnh chính). Trả về thông báo lỗi hoặc null. */
async function applyImages(sb: Awaited<ReturnType<typeof createClient>>, list: { id: string; urls: string[] }[]): Promise<string | null> {
  for (const c of chunk(list, 50)) {
    const del = await sb.from("product_images").delete().in("product_id", c.map((x) => x.id));
    if (del.error) return `${dbError(del.error)} (đã dừng khi cập nhật ảnh).`;
    const rows = c.flatMap((x) => [...new Set(x.urls)].map((image_url, i) => ({ product_id: x.id, image_url, sort_order: i, is_primary: i === 0 })));
    if (rows.length) {
      const { error } = await sb.from("product_images").insert(rows);
      if (error) return `${dbError(error)} (đã dừng khi lưu ảnh).`;
    }
  }
  return null;
}

/** Chỉ cập nhật ảnh cho các sản phẩm đã có (màn hình "Tải ảnh hàng loạt"). */
export async function saveProductImages(images: Record<string, string[]>): Promise<ActionResult> {
  await requireAdmin();
  const bad = checkImageMap(images);
  if (bad) return { ok: false, error: bad };
  const entries = Object.entries(images).filter(([, u]) => u.length > 0);
  if (!entries.length) return { ok: true };
  const sb = await createClient();
  const rs = await Promise.all(chunk(entries.map(([s]) => s), 100).map((c) => sb.from("products").select("id,slug").in("slug", c)));
  for (const r of rs) if (r.error) return { ok: false, error: dbError(r.error) };
  const idBySlug = new Map(rs.flatMap((r) => r.data ?? []).map((p) => [p.slug as string, p.id as string]));
  const err = await applyImages(sb, entries.filter(([s]) => idBySlug.has(s)).map(([s, urls]) => ({ id: idBySlug.get(s)!, urls })));
  return err ? { ok: false, error: err } : { ok: true };
}

/**
 * Cấp chữ ký tải ảnh lên Cloudinary (signed upload). Chỉ admin; thư mục cố định diuem/products/<slug>.
 * Cần env server: CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_UPLOAD_PRESET (tên preset signed).
 */
export async function signUploads(items: { slug: string; id: string }[]): Promise<ActionResult<{ signed: Record<string, { signature: string; timestamp: number; apiKey: string; preset: string; folder: string }> }>> {
  await requireAdmin();
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!apiKey || !secret || !preset) return { ok: false, error: "Server chưa cấu hình Cloudinary (CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET / CLOUDINARY_UPLOAD_PRESET)." };
  if (!Array.isArray(items) || items.length === 0 || items.length > 500) return { ok: false, error: "Danh sách ảnh không hợp lệ." };
  const timestamp = Math.floor(Date.now() / 1000);
  const signed: Record<string, { signature: string; timestamp: number; apiKey: string; preset: string; folder: string }> = {};
  for (const it of items) {
    if (!isSlug(it.slug) || !/^[a-f0-9]{20}$/.test(it.id)) return { ok: false, error: "Dữ liệu ảnh không hợp lệ." };
    const folder = `diuem/products/${it.slug}`;
    // Cloudinary: sắp tham số theo alphabet, nối "k=v&", thêm secret, SHA-1 (không ký file/api_key/resource_type)
    const toSign = `folder=${folder}&public_id=${it.id}&timestamp=${timestamp}&upload_preset=${preset}${secret}`;
    signed[`${it.slug}/${it.id}`] = { signature: createHash("sha1").update(toSign).digest("hex"), timestamp, apiKey, preset, folder };
  }
  return { ok: true, signed };
}