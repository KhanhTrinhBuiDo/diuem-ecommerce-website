import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { allProductsCollection } from "@/data/catalog";
import { exceptNew, getCatalog, newOf, toCard } from "@/lib/storefront";

export const metadata: Metadata = { title: "Sản phẩm" };
export const revalidate = 60;

/** Trang tổng: khối "Sản phẩm mới" (nhãn admin gán) trước, "Tất cả sản phẩm" (không lặp) phía sau. */
export default async function ProductsPage() {
  const { products } = await getCatalog();
  return (
    <CatalogPage
      collection={allProductsCollection}
      newProducts={newOf(products).map(toCard)}
      products={exceptNew(products).map(toCard)}
      crumbs={[{ label: "Sản phẩm" }]}
    />
  );
}
