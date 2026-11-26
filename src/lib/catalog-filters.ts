import type { Product } from "@/components/home/ProductCard";

/**
 * Bộ lọc danh mục (chạy ngay trên danh sách sản phẩm đã tải — catalog nhỏ, không cần gọi server).
 * - Dòng sản phẩm: giá trị thật `products.product_line`.
 * - Dung tích: đọc số ml trong nhãn biến thể ("450 ml", "Túi refill 450 ml"); sản phẩm khớp nếu CÓ biến thể trong khoảng.
 * - Giá: khớp nếu CÓ biến thể trong khoảng.
 * - Phù hợp với: `suitable_for` là văn bản tự do → gắn thẻ theo từ khóa (bên dưới).
 *   TODO(content): khách hàng chốt danh sách thẻ "Phù hợp với"; sau này nên có cột/bảng thẻ riêng.
 */
export type FilterKey = "line" | "size" | "price" | "for";
export type Selected = Record<FilterKey, string[]>;
export const emptySelected = (): Selected => ({ line: [], size: [], price: [], for: [] });
export const hasAny = (s: Selected) => Object.values(s).some((a) => a.length > 0);

type Range = { id: string; label: string; min: number; max: number };
export const SIZE_RANGES: Range[] = [
  { id: "s1", label: "Dưới 50 ml", min: 0, max: 49 },
  { id: "s2", label: "50 – 150 ml", min: 50, max: 150 },
  { id: "s3", label: "151 – 300 ml", min: 151, max: 300 },
  { id: "s4", label: "Trên 300 ml", min: 301, max: Infinity },
];
export const PRICE_RANGES: Range[] = [
  { id: "p1", label: "Dưới 100.000đ", min: 0, max: 99999 },
  { id: "p2", label: "100.000đ – 200.000đ", min: 100000, max: 200000 },
  { id: "p3", label: "200.000đ – 300.000đ", min: 200001, max: 300000 },
  { id: "p4", label: "Trên 300.000đ", min: 300001, max: Infinity },
];
export const FOR_TAGS: { id: string; label: string; re: RegExp }[] = [
  { id: "bau", label: "Mẹ bầu", re: /mẹ bầu|mang thai/i },
  { id: "sausinh", label: "Mẹ sau sinh", re: /sau sinh|cho con bú/i },
  { id: "be", label: "Bé & trẻ nhỏ", re: /(?<![\p{L}])bé(?![\p{L}])|trẻ|sơ sinh/iu },
  { id: "dakho", label: "Da khô", re: /da[^.;]{0,25}khô|khô căng|khô ráp/i },
  { id: "dadau", label: "Da dầu / hỗn hợp", re: /da dầu|hỗn hợp|mụn/i },
  { id: "nhaycam", label: "Da nhạy cảm", re: /nhạy cảm/i },
  { id: "tocrung", label: "Tóc rụng", re: /rụng/i },
  { id: "tockho", label: "Tóc khô, xơ, gãy", re: /tóc[^.;]{0,25}(khô|xơ|gãy|chẻ)/i },
];

const sizesOf = (p: Product) =>
  (p.variants ?? []).flatMap((v) => {
    const m = /(\d+(?:[.,]\d+)?)\s*ml/i.exec(v.label);
    return m ? [Number(m[1].replace(",", "."))] : [];
  });
const pricesOf = (p: Product) => (p.variants?.length ? p.variants.map((v) => v.price) : [p.price]);
const inAny = (nums: number[], ranges: Range[], ids: string[]) => ranges.filter((r) => ids.includes(r.id)).some((r) => nums.some((n) => n >= r.min && n <= r.max));

export function matches(p: Product, s: Selected): boolean {
  if (s.line.length && !s.line.includes(p.line ?? "")) return false;
  if (s.size.length && !inAny(sizesOf(p), SIZE_RANGES, s.size)) return false;
  if (s.price.length && !inAny(pricesOf(p), PRICE_RANGES, s.price)) return false;
  if (s.for.length && !FOR_TAGS.filter((t) => s.for.includes(t.id)).some((t) => t.re.test(p.suitable ?? ""))) return false;
  return true;
}

export type Option = { id: string; label: string; count: number };
/** Các lựa chọn của từng mục, kèm số sản phẩm khớp (trên toàn bộ danh sách, không theo bộ lọc đang chọn). Mục không có sản phẩm nào thì bỏ. */
export function buildFacets(products: Product[]): Record<FilterKey, Option[]> {
  const lines = new Map<string, number>();
  for (const p of products) if (p.line) lines.set(p.line, (lines.get(p.line) ?? 0) + 1);
  const rangeOpts = (rs: Range[], pick: (p: Product) => number[]) =>
    rs.map((r) => ({ id: r.id, label: r.label, count: products.filter((p) => pick(p).some((n) => n >= r.min && n <= r.max)).length })).filter((o) => o.count > 0);
  return {
    line: [...lines].sort((a, b) => a[0].localeCompare(b[0], "vi")).map(([l, count]) => ({ id: l, label: l, count })),
    size: rangeOpts(SIZE_RANGES, sizesOf),
    price: rangeOpts(PRICE_RANGES, pricesOf),
    for: FOR_TAGS.map((t) => ({ id: t.id, label: t.label, count: products.filter((p) => t.re.test(p.suitable ?? "")).length })).filter((o) => o.count > 0),
  };
}
