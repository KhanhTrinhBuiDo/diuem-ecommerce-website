/** Cấu trúc file Excel nhập sản phẩm (dùng chung cho file mẫu và bộ đọc file). */
export type ImportKey =
  | "name" | "category" | "size_value" | "size_unit" | "price_vnd" | "images" | "short_description"
  | "sku" | "stock_qty" | "slug" | "status" | "is_featured" | "hero_material" | "usage_instructions" | "storage_instructions" | "warnings" | "shelf_life_months" | "pao_months";

export type ImportCol = { key: ImportKey; header: string; required: boolean; width: number; note: string };

/** Nhóm A: hiển thị trên web, BẮT BUỘC (với sản phẩm mới). */
export const REQUIRED_COLS: ImportCol[] = [
  { key: "name", header: "Tên sản phẩm *", required: true, width: 34, note: "Hiển thị trên web. Nhiều dòng cùng tên (hoặc cùng slug) = cùng 1 sản phẩm có nhiều phiên bản dung tích." },
  { key: "category", header: "Danh mục *", required: true, width: 24, note: "Chọn từ danh sách (tên hoặc slug trong sheet 'Danh mục')." },
  { key: "size_value", header: "Dung tích / khối lượng *", required: true, width: 16, note: "Số, vd 100 hoặc 7.5." },
  { key: "size_unit", header: "Đơn vị *", required: true, width: 10, note: "ml, g, cái, bộ." },
  { key: "price_vnd", header: "Giá bán (VND) *", required: true, width: 16, note: "Số nguyên, vd 250000 (chấp nhận 250.000)." },
  { key: "images", header: "Ảnh (link Cloudinary) *", required: true, width: 50, note: "Nhiều link cách nhau bằng dấu cách, dấu phẩy hoặc xuống dòng. Link đầu tiên là ảnh chính. Tối đa 10 ảnh." },
  { key: "short_description", header: "Mô tả ngắn *", required: true, width: 44, note: "Hiển thị trên web." },
];

/** Nhóm B: không bắt buộc; để trống thì dùng mặc định. */
export const OPTIONAL_COLS: ImportCol[] = [
  { key: "sku", header: "Mã SKU", required: false, width: 18, note: "Không hiển thị. Để trống: tự tạo từ slug + dung tích. Dùng SKU để cập nhật đúng phiên bản." },
  { key: "stock_qty", header: "Tồn kho", required: false, width: 10, note: "Không hiển thị. Mặc định 0." },
  { key: "slug", header: "Slug (đường dẫn)", required: false, width: 24, note: "Để trống: tự tạo từ tên. Slug đã tồn tại = cập nhật sản phẩm đó." },
  { key: "status", header: "Trạng thái", required: false, width: 13, note: "Nháp / Đang bán / Ngừng bán. Mặc định: Nháp (an toàn, bật lên sau khi kiểm tra)." },
  { key: "is_featured", header: "Nổi bật", required: false, width: 9, note: "Có / Không. Mặc định Không." },
  { key: "hero_material", header: "Thành phần chính", required: false, width: 26, note: "" },
  { key: "usage_instructions", header: "Hướng dẫn sử dụng", required: false, width: 36, note: "" },
  { key: "storage_instructions", header: "Hướng dẫn bảo quản", required: false, width: 30, note: "" },
  { key: "warnings", header: "Lưu ý", required: false, width: 30, note: "" },
  { key: "shelf_life_months", header: "Hạn sử dụng (tháng)", required: false, width: 12, note: "Số nguyên dương." },
  { key: "pao_months", header: "Dùng trong (tháng sau mở nắp)", required: false, width: 14, note: "Số nguyên dương." },
];

export const ALL_COLS = [...REQUIRED_COLS, ...OPTIONAL_COLS];
export const SHEET_PRODUCTS = "Sản phẩm";
export const SHEET_CATEGORIES = "Danh mục";
export const SHEET_HELP = "Hướng dẫn";
export const MAX_IMPORT_ROWS = 500;
export const MAX_IMPORT_BYTES = 3 * 1024 * 1024;
export const SAMPLE_PREFIX = "(Ví dụ";

export const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/\*/g, "").replace(/\s+/g, " ").trim();

/** Tách nhiều link: dấu cách / xuống dòng / ; / | / dấu phẩy (không cắt dấu phẩy nằm trong link Cloudinary như c_fill,w_300). */
export function splitLinks(s: string): string[] {
  return s
    .split(/,?\s+|;|\||,(?=https?:\/\/)/)
    .map((x) => x.trim().replace(/[,;]+$/, ""))
    .filter(Boolean);
}

export type ImportSummary = { created: number; updated: number; variants: number; products: { name: string; slug: string; isNew: boolean; variants: number }[] };
export type RowError = { row: number; message: string };
export type ImportResponse =
  | { ok: true; committed: boolean; summary: ImportSummary }
  | { ok: false; error: string; rowErrors?: RowError[] };
