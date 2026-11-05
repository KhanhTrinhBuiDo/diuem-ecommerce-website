import "server-only";
import ExcelJS from "exceljs";
import type { CategoryRow, SizeUnit } from "@/lib/admin-types";
import { isCloudinaryUrl, isSlug, slugify } from "@/lib/admin-validate";
import { ALL_COLS, MAX_IMPORT_ROWS, REQUIRED_COLS, SAMPLE_PREFIX, SHEET_CATEGORIES, SHEET_HELP, SHEET_PRODUCTS, norm, splitLinks, type ImportKey, type RowError } from "@/lib/admin-import-spec";

/* ───────── File mẫu ───────── */
export async function buildTemplate(categories: CategoryRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(SHEET_PRODUCTS, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = ALL_COLS.map((c) => ({ key: c.key, width: c.width }));
  const head = ws.getRow(1);
  ALL_COLS.forEach((c, i) => {
    const cell = head.getCell(i + 1);
    cell.value = c.header;
    cell.font = { bold: true, color: { argb: c.required ? "FF000000" : "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: c.required ? "FFFF66C4" : "FF555555" } };
    cell.alignment = { vertical: "middle", wrapText: true };
    if (c.note) cell.note = c.note;
  });
  head.height = 36;

  const col = (k: ImportKey) => ALL_COLS.findIndex((c) => c.key === k) + 1;
  const sample = [
    { name: `${SAMPLE_PREFIX} - xóa dòng này) Dầu gội hoa bưởi`, category: categories.find((c) => c.parent_id)?.name ?? "", size_value: 250, size_unit: "ml", price_vnd: 180000, images: "https://res.cloudinary.com/ten-cloud/image/upload/v1/anh-chinh.jpg https://res.cloudinary.com/ten-cloud/image/upload/v1/anh-phu.jpg", short_description: "Làm sạch dịu nhẹ, hương hoa bưởi.", sku: "DAU-GOI-250", stock_qty: 50, status: "Đang bán" },
    { name: `${SAMPLE_PREFIX} - dòng thứ 2 cùng tên = phiên bản khác) Dầu gội hoa bưởi`, size_value: 500, size_unit: "ml", price_vnd: 320000, sku: "DAU-GOI-500", stock_qty: 30 },
  ];
  sample.forEach((r, i) => {
    const row = ws.getRow(i + 2);
    for (const [k, v] of Object.entries(r)) row.getCell(col(k as ImportKey)).value = v as ExcelJS.CellValue;
    row.font = { italic: true, color: { argb: "FF777777" } };
  });
  // Dòng 2 và 3 là ví dụ nhưng dòng 3 khác tên → để tránh gộp nhầm, ví dụ thứ 2 dùng cùng slug
  ws.getRow(2).getCell(col("slug")).value = "dau-goi-hoa-buoi-vi-du";
  ws.getRow(3).getCell(col("slug")).value = "dau-goi-hoa-buoi-vi-du";

  // Sheet danh mục (tham khảo + nguồn cho danh sách chọn)
  const leaves = categories.filter((c) => c.parent_id);
  const list = leaves.length ? leaves : categories;
  const wc = wb.addWorksheet(SHEET_CATEGORIES);
  wc.columns = [{ header: "Tên danh mục", width: 32 }, { header: "Slug", width: 30 }, { header: "Thuộc nhóm", width: 26 }];
  wc.getRow(1).font = { bold: true };
  for (const c of list) wc.addRow([c.name, c.slug, categories.find((p) => p.id === c.parent_id)?.name ?? ""]);

  const n = MAX_IMPORT_ROWS + 1;
  const dv = (k: ImportKey, formulae: string[]) => {
    for (let r = 2; r <= n; r++) ws.getCell(r, col(k)).dataValidation = { type: "list", allowBlank: true, formulae };
  };
  if (list.length) dv("category", [`'${SHEET_CATEGORIES}'!$A$2:$A$${list.length + 1}`]);
  dv("size_unit", ['"ml,g,cái,bộ"']);
  dv("status", ['"Nháp,Đang bán,Ngừng bán"']);
  dv("is_featured", ['"Có,Không"']);

  const wh = wb.addWorksheet(SHEET_HELP);
  wh.getColumn(1).width = 110;
  [
    "HƯỚNG DẪN NHẬP SẢN PHẨM BẰNG EXCEL",
    "",
    "1. Điền dữ liệu ở sheet 'Sản phẩm', mỗi dòng = 1 phiên bản (dung tích/giá). Giữ nguyên dòng tiêu đề (dòng 1).",
    "2. Cột tiêu đề màu HỒNG (có dấu *) là thông tin hiển thị trên web và BẮT BUỘC với sản phẩm mới. Cột màu XÁM là không bắt buộc; để trống sẽ dùng mặc định.",
    "3. Sản phẩm có nhiều dung tích: viết nhiều dòng cùng Tên (hoặc cùng Slug). Thông tin chung lấy ở dòng đầu tiên.",
    "4. Nhiều ảnh trong 1 ô: cách nhau bằng dấu cách, dấu phẩy hoặc xuống dòng. Link đầu tiên là ảnh chính. Ví dụ: link1 link2 link3. Chỉ nhận link https://res.cloudinary.com/...",
    "5. Slug đã tồn tại trong hệ thống = CẬP NHẬT sản phẩm đó (ô để trống sẽ giữ nguyên giá trị cũ). Phiên bản khớp theo Mã SKU; phiên bản không có trong file được giữ nguyên.",
    "6. Trạng thái mặc định của sản phẩm mới là 'Nháp'; vào trang Sản phẩm để bật 'Đang bán' sau khi kiểm tra.",
    `7. Xóa các dòng ví dụ (tên bắt đầu bằng "${SAMPLE_PREFIX}") — hệ thống tự bỏ qua chúng. Tối đa ${MAX_IMPORT_ROWS} dòng mỗi lần.`,
    "8. Hệ thống luôn kiểm tra thử trước; chỉ khi không có lỗi mới cho nhập. Combo (bộ nhiều sản phẩm) chưa hỗ trợ nhập bằng file.",
  ].forEach((t, i) => {
    const c = wh.getCell(i + 1, 1);
    c.value = t;
    c.alignment = { wrapText: true, vertical: "top" };
    if (i === 0) c.font = { bold: true, size: 14 };
  });
  return Buffer.from(await wb.xlsx.writeBuffer());
}

/* ───────── Đọc file ───────── */
export type ParsedVariant = { row: number; sku: string; size_value: number; size_unit: SizeUnit; price_vnd: number; stock_qty: number | null };
export type ParsedProduct = {
  firstRow: number;
  slug: string;
  name: string;
  category_id: string | null;
  images: string[];
  short_description: string | null;
  status: "draft" | "active" | "discontinued" | null;
  is_featured: boolean | null;
  hero_material: string | null;
  usage_instructions: string | null;
  storage_instructions: string | null;
  warnings: string | null;
  shelf_life_months: number | null;
  pao_months: number | null;
  variants: ParsedVariant[];
};

function cellText(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const o = v as unknown as Record<string, unknown>;
  if (Array.isArray(o.richText)) return (o.richText as { text: string }[]).map((t) => t.text).join("").trim();
  if (typeof o.hyperlink === "string") return (typeof o.text === "string" && o.text.trim() ? o.text : o.hyperlink).toString().trim();
  if ("result" in o) return cellText(o.result as ExcelJS.CellValue);
  return "";
}
/** Với ô ảnh: nếu ô là hyperlink thì lấy URL thật. */
function linkText(v: ExcelJS.CellValue): string {
  const o = v as unknown as Record<string, unknown> | null;
  if (o && typeof o === "object" && !Array.isArray(o.richText) && typeof o.hyperlink === "string") return o.hyperlink;
  return cellText(v);
}

const unitMap: Record<string, SizeUnit> = { ml: "ml", g: "g", gram: "g", gr: "g", cai: "pcs", pcs: "pcs", chiec: "pcs", bo: "set", set: "set" };
const statusMap: Record<string, "draft" | "active" | "discontinued"> = { nhap: "draft", draft: "draft", "dang ban": "active", active: "active", "ngung ban": "discontinued", discontinued: "discontinued" };
const yes = new Set(["co", "x", "1", "true", "yes", "y", "true"]);

export async function parseWorkbook(buf: Buffer | ArrayBuffer, categories: CategoryRow[]): Promise<{ products: ParsedProduct[]; errors: RowError[] }> {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(buf as ArrayBuffer);
  } catch {
    return { products: [], errors: [{ row: 0, message: "Không đọc được file. Hãy dùng file .xlsx (tải file mẫu và điền vào)." }] };
  }
  const ws = wb.getWorksheet(SHEET_PRODUCTS) ?? wb.worksheets[0];
  if (!ws) return { products: [], errors: [{ row: 0, message: "File không có sheet nào." }] };

  // Ánh xạ cột theo tiêu đề
  const colOf = new Map<ImportKey, number>();
  ws.getRow(1).eachCell({ includeEmpty: false }, (cell, n) => {
    const h = norm(cellText(cell.value));
    const spec = ALL_COLS.find((c) => norm(c.header) === h);
    if (spec && !colOf.has(spec.key)) colOf.set(spec.key, n);
  });
  const missing = REQUIRED_COLS.filter((c) => !colOf.has(c.key)).map((c) => c.header);
  if (missing.length) return { products: [], errors: [{ row: 1, message: `Thiếu cột: ${missing.join("; ")}. Hãy dùng đúng file mẫu.` }] };

  const errors: RowError[] = [];
  const err = (row: number, message: string) => errors.push({ row, message });
  const catByKey = new Map<string, CategoryRow[]>();
  for (const c of categories) for (const k of [norm(c.name), norm(c.slug)]) catByKey.set(k, [...(catByKey.get(k) ?? []), c]);

  const products = new Map<string, ParsedProduct>();
  let dataRows = 0;
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const get = (k: ImportKey) => {
      const n = colOf.get(k);
      return n ? cellText(row.getCell(n).value) : "";
    };
    const vals = ALL_COLS.map((c) => get(c.key)).filter(Boolean);
    if (vals.length === 0) continue; // dòng trống
    const name = get("name");
    if (name.startsWith(SAMPLE_PREFIX)) continue; // dòng ví dụ
    if (++dataRows > MAX_IMPORT_ROWS) {
      err(r, `Vượt quá ${MAX_IMPORT_ROWS} dòng mỗi lần nhập.`);
      break;
    }

    // slug / nhóm sản phẩm
    let slug = get("slug").trim().toLowerCase();
    if (!slug) slug = slugify(name);
    if (!slug) { err(r, "Thiếu Tên sản phẩm (hoặc Slug)."); continue; }
    if (!isSlug(slug)) { err(r, `Slug "${slug}" không hợp lệ (chỉ chữ thường, số, dấu gạch ngang).`); continue; }

    let p = products.get(slug);
    const isFirst = !p;
    if (!p) {
      p = { firstRow: r, slug, name: name.trim(), category_id: null, images: [], short_description: null, status: null, is_featured: null, hero_material: null, usage_instructions: null, storage_instructions: null, warnings: null, shelf_life_months: null, pao_months: null, variants: [] };
      products.set(slug, p);
    }
    if (isFirst) {
      if (name.length > 200) err(r, "Tên sản phẩm tối đa 200 ký tự.");
      const cat = get("category");
      if (cat) {
        const hit = catByKey.get(norm(cat)) ?? [];
        if (hit.length === 1) p.category_id = hit[0].id;
        else err(r, hit.length ? `Danh mục "${cat}" trùng tên nhiều nhóm, hãy dùng slug.` : `Không tìm thấy danh mục "${cat}" (xem sheet 'Danh mục').`);
      }
      const imgCell = colOf.get("images") ? linkText(row.getCell(colOf.get("images")!).value) : "";
      p.images = splitLinks(imgCell);
      if (p.images.length > 10) err(r, "Tối đa 10 ảnh.");
      for (const u of p.images) if (!isCloudinaryUrl(u)) { err(r, `Ảnh không hợp lệ (chỉ nhận https://res.cloudinary.com/...): ${u.slice(0, 60)}`); break; }
      const text = (k: ImportKey) => get(k) || null;
      p.short_description = text("short_description");
      p.hero_material = text("hero_material");
      p.usage_instructions = text("usage_instructions");
      p.storage_instructions = text("storage_instructions");
      p.warnings = text("warnings");
      const st = get("status");
      if (st) {
        const s = statusMap[norm(st)];
        if (s) p.status = s; else err(r, `Trạng thái "${st}" không hợp lệ (Nháp / Đang bán / Ngừng bán).`);
      }
      const ft = get("is_featured");
      if (ft) p.is_featured = yes.has(norm(ft));
      for (const k of ["shelf_life_months", "pao_months"] as const) {
        const t = get(k);
        if (!t) continue;
        const n = Number(t.replace(/[^\d.]/g, ""));
        if (Number.isInteger(n) && n > 0) p[k] = n; else err(r, `${k === "pao_months" ? "Dùng trong (tháng)" : "Hạn sử dụng (tháng)"} phải là số nguyên dương.`);
      }
    }

    // phiên bản (mỗi dòng 1 phiên bản)
    const sv = get("size_value");
    const su = get("size_unit");
    const pr = get("price_vnd");
    if (!sv || !su || !pr) { err(r, "Thiếu Dung tích, Đơn vị hoặc Giá bán."); continue; }
    const size = Number(sv.replace(",", "."));
    const unit = unitMap[norm(su)];
    const price = Number(pr.replace(/[^\d]/g, ""));
    if (!(size > 0)) { err(r, "Dung tích phải là số lớn hơn 0."); continue; }
    if (!unit) { err(r, `Đơn vị "${su}" không hợp lệ (ml, g, cái, bộ).`); continue; }
    if (!Number.isInteger(price) || pr.replace(/[^\d]/g, "") === "") { err(r, "Giá bán phải là số nguyên (VND)."); continue; }
    const stockT = get("stock_qty");
    let stock: number | null = null;
    if (stockT) {
      stock = Number(stockT.replace(/[^\d]/g, ""));
      if (!Number.isInteger(stock) || stock < 0) { err(r, "Tồn kho phải là số nguyên ≥ 0."); continue; }
    }
    const sku = (get("sku") || `${slug}-${size}${unit}`).trim().toUpperCase();
    if (p.variants.some((v) => v.sku === sku)) { err(r, `SKU "${sku}" bị lặp trong file.`); continue; }
    p.variants.push({ row: r, sku, size_value: size, size_unit: unit, price_vnd: price, stock_qty: stock });
  }
  if (products.size === 0 && errors.length === 0) errors.push({ row: 0, message: "File không có dòng dữ liệu nào (hãy xóa dòng ví dụ và điền sản phẩm)." });
  return { products: [...products.values()], errors };
}
