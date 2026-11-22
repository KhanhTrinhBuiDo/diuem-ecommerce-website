import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { newArrivalsCollection } from "@/data/catalog";
import { exceptNew, getCatalog, newOf, toCard } from "@/lib/storefront";

export const metadata: Metadata = { title: "New Arrivals" };
export const revalidate = 60;

/** Cùng bố cục với /san-pham: sản phẩm mới (nhãn admin gán) trước, tất cả sản phẩm phía sau. */
export default async function NewArrivalsPage() {
  const { products } = await getCatalog();
  return (
    <CatalogPage
      collection={newArrivalsCollection}
      newProducts={newOf(products).map(toCard)}
      products={exceptNew(products).map(toCard)}
      crumbs={[{ label: "New Arrivals" }]}
    />
  );
}
