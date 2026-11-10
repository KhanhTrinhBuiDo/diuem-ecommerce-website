import type { CategoryRow, CouponRow, ProductInput } from "@/lib/admin-types";
import { sizeUnits } from "@/lib/admin-types";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const isSlug = (s: string) => SLUG.test(s);

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Ảnh chỉ nhận link https từ Cloudinary (chống chèn link tùy ý). */
/** Ảnh phải thuộc đúng cloud của shop (nếu đã đặt NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME), tránh link từ tài khoản Cloudinary khác. */
export function isOwnImage(u: string): boolean {
  if (!isCloudinaryUrl(u)) return false;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return !cloud || new URL(u).pathname.startsWith(`/${cloud}/`);
}

export function isCloudinaryUrl(u: string): boolean {
  try {
    const x = new URL(u);
    return x.protocol === "https:" && x.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

const int = (n: unknown) => typeof n === "number" && Number.isInteger(n);

export function validateProduct(p: ProductInput): string | null {
  if (!p.name.trim() || p.name.length > 200) return "Tên sản phẩm bắt buộc (tối đa 200 ký tự).";
  if (!isSlug(p.slug)) return "Slug chỉ gồm chữ thường, số và dấu gạch ngang.";
  if (!p.category_id) return "Hãy chọn danh mục.";
  if (!["draft", "active", "discontinued"].includes(p.status)) return "Trạng thái không hợp lệ.";
  if (p.shelf_life_months !== null && !(int(p.shelf_life_months) && p.shelf_life_months > 0)) return "Hạn sử dụng (tháng) phải là số nguyên dương.";
  if (p.pao_months !== null && !(int(p.pao_months) && p.pao_months > 0)) return "Dùng trong (tháng sau mở nắp) phải là số nguyên dương.";
  if (p.variants.length === 0) return "Cần ít nhất một phiên bản (dung tích/giá).";
  const skus = new Set<string>();
  for (const v of p.variants) {
    if (!v.sku.trim()) return "Mỗi phiên bản cần mã SKU.";
    if (skus.has(v.sku.trim())) return `SKU "${v.sku}" bị trùng trong sản phẩm.`;
    skus.add(v.sku.trim());
    if (!(typeof v.size_value === "number" && v.size_value > 0)) return "Dung tích phải lớn hơn 0.";
    if (!sizeUnits.includes(v.size_unit)) return "Đơn vị không hợp lệ.";
    if (!(int(v.price_vnd) && v.price_vnd >= 0)) return "Giá phải là số nguyên ≥ 0.";
    if (!(int(v.stock_qty) && v.stock_qty >= 0)) return "Tồn kho phải là số nguyên ≥ 0.";
  }
  if (p.images.length > 10) return "Tối đa 10 ảnh.";
  for (const u of p.images) if (!isCloudinaryUrl(u)) return "Ảnh phải là link https://res.cloudinary.com/...";
  return null;
}

export function validateCoupon(c: CouponRow): string | null {
  if (!/^[A-Z0-9_-]{3,32}$/.test(c.code)) return "Mã gồm chữ HOA, số, _ hoặc - (3–32 ký tự).";
  if (!["percent", "fixed"].includes(c.discount_type)) return "Loại giảm không hợp lệ.";
  if (!(int(c.discount_value) && c.discount_value > 0)) return "Giá trị giảm phải là số nguyên > 0.";
  if (c.discount_type === "percent" && c.discount_value > 100) return "Giảm theo % tối đa 100.";
  if (!(int(c.min_order_vnd) && c.min_order_vnd >= 0)) return "Đơn tối thiểu phải ≥ 0.";
  if (c.starts_at && c.ends_at && c.starts_at > c.ends_at) return "Ngày bắt đầu phải trước ngày kết thúc.";
  return null;
}

export function validateCategory(c: CategoryRow): string | null {
  if (!c.name.trim()) return "Tên danh mục bắt buộc.";
  if (!isSlug(c.slug)) return "Slug chỉ gồm chữ thường, số và dấu gạch ngang.";
  if (!int(c.sort_order)) return "Thứ tự phải là số nguyên.";
  if (c.min_price_vnd !== null && !(int(c.min_price_vnd) && c.min_price_vnd >= 0)) return "Giá tối thiểu phải ≥ 0.";
  if (c.parent_id && c.parent_id === c.id) return "Danh mục không thể là cha của chính nó.";
  return null;
}