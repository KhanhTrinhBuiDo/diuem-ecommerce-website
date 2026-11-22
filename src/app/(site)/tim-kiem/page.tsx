import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { getCatalog, searchProducts, toCard } from "@/lib/storefront";

export const metadata: Metadata = { title: "Tìm kiếm", robots: { index: false } };

/** /tim-kiem?q=... — tìm theo tên, danh mục, nguyên liệu, dòng sản phẩm, SKU (không phân biệt dấu). */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.slice(0, 80) ?? "";
  const { products } = await getCatalog();
  const found = searchProducts(products, q).map(toCard);
  return (
    <CatalogPage
      collection={{ slug: "tim-kiem", name: "Tìm kiếm", title: q ? `KẾT QUẢ CHO "${q.toLocaleUpperCase("vi")}"` : "TÌM KIẾM", banner: null }}
      products={found}
      crumbs={[{ label: "Tìm kiếm" }]}
    />
  );
}
