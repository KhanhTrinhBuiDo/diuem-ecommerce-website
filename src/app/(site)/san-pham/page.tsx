import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { allProductsCollection, getNewProducts, getProductsExceptNew } from "@/data/catalog";

export const metadata: Metadata = { title: "Sản phẩm" };

/** Trang tổng: khối "Sản phẩm mới" (nhãn admin gán) trước, "Tất cả sản phẩm" phía sau. TODO(supabase): lấy từ bảng products. */
export default function ProductsPage() {
  return (
    <CatalogPage
      collection={allProductsCollection}
      newProducts={getNewProducts()}
      products={getProductsExceptNew(allProductsCollection.slug)}
      crumbs={[{ label: "Sản phẩm" }]}
    />
  );
}