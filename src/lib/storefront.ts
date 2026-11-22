import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/components/home/ProductCard";
import type { Collection } from "@/data/catalog";
import { collectionBanner } from "@/data/catalog";
import type { ProductDetail, Variant } from "@/data/products";
import { productHref } from "@/data/products";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Đọc dữ liệu cửa hàng (khách) từ Supabase bằng quyền ẩn danh (RLS cho phép đọc sản phẩm đang bán).
 * Cả danh mục + sản phẩm chỉ ~vài chục dòng nên tải một lần, cache 60 giây (tag "catalog"; admin lưu là xóa cache ngay),
 * rồi lọc/ghép trong bộ nhớ. TODO(scale): khi > vài trăm sản phẩm thì chuyển sang truy vấn có lọc/phân trang.
 */

export type Cat = { id: string; slug: string; name: string; parentId: string | null; sortOrder: number; minPrice: number | null };
export type CatalogProduct = {
    id: string;
    slug: string;
    name: string;
    isNew: boolean;
    isFeatured: boolean;
    createdAt: string;
    categoryId: string;
    /** Danh mục con (vd Dầu gội) và danh mục cha (vd Chăm sóc tóc) */
    category: Cat;
    parent: Cat | null;
    heroMaterial: string;
    shortDescription: string;
    usage: string;
    storage: string;
    warnings: string;
    shelfLifeMonths: number | null;
    paoMonths: number | null;
    ingredients: string;
    suitableFor: string;
    region: string;
    productLine: string;
    images: string[];
    variants: Variant[];
};
export type Catalog = { categories: Cat[]; products: CatalogProduct[] };

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Bỏ ghi chú nội bộ trong nhãn CSV: "50 ml (mini/du lịch)" → "50 ml", "70 ml chính" → "70 ml". */
const cleanLabel = (l: string) => l.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+chính$/i, "").trim();

/** Nhãn mặc định khi CSV không có nhãn riêng: "450 ml". */
const sizeLabel = (value: number, unit: string) => `${Number.isInteger(value) ? value : String(value).replace(".", ",")} ${unit === "pcs" ? "cái" : unit}`;

/** Chuyển dữ liệu thô từ PostgREST thành mô hình cửa hàng (hàm thuần, có test). */
export function buildCatalog(catRows: Row[], prodRows: Row[]): Catalog {
    const categories: Cat[] = catRows.map((c) => ({
        id: str(c.id), slug: str(c.slug), name: str(c.name), parentId: (c.parent_id as string | null) ?? null,
        sortOrder: Number(c.sort_order ?? 0), minPrice: c.min_price_vnd == null ? null : Number(c.min_price_vnd),
    }));
    const byId = new Map(categories.map((c) => [c.id, c]));
    const products: CatalogProduct[] = [];
    for (const p of prodRows) {
        const category = byId.get(str(p.category_id));
        if (!category) continue;
        const imgs = ((p.product_images as Row[]) ?? []).map((i) => ({ url: str(i.image_url), vid: (i.variant_id as string | null) ?? null, order: Number(i.sort_order ?? 0), primary: Boolean(i.is_primary) }));
        const shared = imgs.filter((i) => !i.vid).sort((a, b) => Number(b.primary) - Number(a.primary) || a.order - b.order).map((i) => i.url);
        const variants: Variant[] = ((p.product_variants as Row[]) ?? [])
            .filter((v) => v.is_active)
            .map((v) => ({ v, size: Number(v.size_value), refill: /refill/i.test(str(v.label)) || /-R\d+$/i.test(str(v.sku)) }))
            .sort((a, b) => Number(a.refill) - Number(b.refill) || a.size - b.size)
            .map(({ v, size }) => ({
                id: str(v.sku),
                label: cleanLabel(str(v.label)) || sizeLabel(size, str(v.size_unit)),
                price: Number(v.price_vnd),
                available: Number(v.stock_qty) > 0,
                isDefault: Boolean(v.is_default),
                images: imgs.filter((i) => i.vid === v.id).sort((a, b) => a.order - b.order).map((i) => i.url),
            }));
        if (!variants.length) continue;
        products.push({
            id: str(p.id), slug: str(p.slug), name: str(p.name), isNew: Boolean(p.is_new), isFeatured: Boolean(p.is_featured), createdAt: str(p.created_at),
            categoryId: category.id, category, parent: category.parentId ? byId.get(category.parentId) ?? null : null,
            heroMaterial: str(p.hero_material), shortDescription: str(p.short_description), usage: str(p.usage_instructions), storage: str(p.storage_instructions), warnings: str(p.warnings),
            shelfLifeMonths: (p.shelf_life_months as number | null) ?? null, paoMonths: (p.pao_months as number | null) ?? null,
            ingredients: str(p.ingredients), suitableFor: str(p.suitable_for), region: str(p.region), productLine: str(p.product_line),
            images: shared, variants,
        });
    }
    return { categories, products };
}

async function fetchCatalog(): Promise<Catalog> {
    const sb = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const [c, p] = await Promise.all([
        sb.from("storefront_categories").select("id,parent_id,slug,name,sort_order,min_price_vnd").order("sort_order"),
        sb
            .from("products")
            .select("id,slug,name,is_new,is_featured,created_at,category_id,hero_material,short_description,usage_instructions,storage_instructions,warnings,shelf_life_months,pao_months,ingredients,suitable_for,region,product_line,product_variants(id,sku,size_value,size_unit,price_vnd,stock_qty,is_active,label,is_default),product_images(image_url,sort_order,is_primary,variant_id)")
            .eq("status", "active")
            .is("deleted_at", null)
            .order("created_at", { ascending: false }),
    ]);
    if (c.error) throw new Error(c.error.message);
    if (p.error) throw new Error(p.error.message);
    return buildCatalog(c.data ?? [], p.data ?? []);
}

const cached = unstable_cache(fetchCatalog, ["storefront-catalog"], { revalidate: 60, tags: ["catalog"] });

/** Lỗi/chưa cấu hình Supabase → catalog rỗng (trang vẫn dựng được, không sập). */
export async function getCatalog(): Promise<Catalog> {
    if (!isSupabaseConfigured()) return { categories: [], products: [] };
    try {
        return await cached();
    } catch (e) {
        console.error("[storefront] không đọc được catalog:", e);
        return { categories: [], products: [] };
    }
}

// ---------- hiển thị ----------

/** Danh mục cấp cao nhất của sản phẩm (dùng cho URL /san-pham/<danh-mục>/<slug>). */
export const topCategory = (p: CatalogProduct) => p.parent ?? p.category;

export function defaultVariantOf(p: CatalogProduct): Variant {
    return p.variants.find((v) => v.isDefault && v.available) ?? p.variants.find((v) => v.isDefault) ?? p.variants.find((v) => v.available) ?? p.variants[0];
}

export const hrefOf = (p: CatalogProduct) => productHref(topCategory(p).slug, p.slug);

export function toCard(p: CatalogProduct): Product {
    return {
        id: p.id, name: p.name, price: defaultVariantOf(p).price, image: p.images[0] ?? p.variants.flatMap((v) => v.images ?? [])[0] ?? null, href: hrefOf(p),
        variants: p.variants, variantId: defaultVariantOf(p).id,
    };
}

const monthsText = (p: CatalogProduct) => {
    const parts: string[] = [];
    if (p.shelfLifeMonths) parts.push(`${p.shelfLifeMonths} tháng kể từ ngày sản xuất`);
    if (p.paoMonths) parts.push(`sau khi mở nắp nên dùng trong ${p.paoMonths} tháng`);
    return parts.join("; ");
};

export function toDetail(p: CatalogProduct): ProductDetail {
    const rows = [
        { label: "Dòng sản phẩm", value: p.productLine },
        { label: "Nguyên liệu chủ đạo", value: [p.heroMaterial, p.region && `vùng ${p.region}`].filter(Boolean).join(" · ") },
        { label: "Thành phần", value: p.ingredients },
        { label: "Hạn sử dụng", value: monthsText(p) },
        { label: "Phù hợp với", value: p.suitableFor },
        { label: "Hướng dẫn", value: p.usage },
        { label: "Bảo quản", value: p.storage },
        { label: "Lưu ý", value: p.warnings },
    ].filter((r) => r.value.trim());
    const variantImgs = p.variants.flatMap((v) => v.images ?? []);
    const gallery: string[] = [...new Set([...p.images.slice(0, 1), ...variantImgs, ...p.images.slice(1)])];
    return {
        slug: p.slug, name: p.name, category: p.category.name, variants: p.variants,
        images: gallery.length ? gallery : [null],
        descriptionImage: p.images[2] ?? null,
        freeShip: true,
        description: { intro: p.shortDescription, rows, footnote: "* Proudly Made in Vietnam" },
    };
}

// ---------- truy vấn ----------

/** Danh mục (cha hoặc con) theo slug → thông tin trang + tập sản phẩm. */
export function resolveCollection(cat: Catalog, slug: string): { collection: Collection; products: CatalogProduct[]; crumbParent: Cat | null } | null {
    const c = cat.categories.find((x) => x.slug === slug);
    if (!c) return null;
    const ids = new Set([c.id, ...cat.categories.filter((x) => x.parentId === c.id).map((x) => x.id)]);
    const parent = c.parentId ? cat.categories.find((x) => x.id === c.parentId) ?? null : null;
    const title = (c.slug === "cham-soc-be" ? "Chăm sóc em bé" : c.name);
    return {
        collection: { slug: c.slug, name: title, title: title.toLocaleUpperCase("vi"), banner: collectionBanner(c.slug) ?? (parent ? collectionBanner(parent.slug) : null) },
        products: cat.products.filter((p) => ids.has(p.categoryId)),
        crumbParent: parent,
    };
}

export const newOf = (ps: CatalogProduct[]) => ps.filter((p) => p.isNew);
export const exceptNew = (ps: CatalogProduct[]) => ps.filter((p) => !p.isNew);

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();
export function searchProducts(ps: CatalogProduct[], q: string): CatalogProduct[] {
    const terms = fold(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return ps.filter((p) => {
        const hay = fold(`${p.name} ${p.category.name} ${p.heroMaterial} ${p.productLine} ${p.variants.map((v) => v.id).join(" ")}`);
        return terms.every((t) => hay.includes(t));
    });
}

/** Gợi ý: cùng danh mục con trước, rồi cùng danh mục cha, rồi còn lại; bỏ chính nó. */
export function related(ps: CatalogProduct[], p: CatalogProduct, n: number): CatalogProduct[] {
    const rank = (x: CatalogProduct) => (x.categoryId === p.categoryId ? 0 : topCategory(x).id === topCategory(p).id ? 1 : 2);
    return ps.filter((x) => x.id !== p.id).sort((a, b) => rank(a) - rank(b)).slice(0, n);
}