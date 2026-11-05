import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { allProductsCollection, getProducts } from "@/data/catalog";

export const metadata: Metadata = { title: "Sản phẩm" };

/** Trang tổng tất cả sản phẩm. TODO(supabase): lấy từ bảng products. */
export default function ProductsPage() {
  return <CatalogPage collection={allProductsCollection} products={getProducts(allProductsCollection.slug)} crumbs={[{ label: "Sản phẩm" }]} />;
}
