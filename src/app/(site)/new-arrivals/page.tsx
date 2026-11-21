import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { getNewProducts, getProductsExceptNew, newArrivalsCollection } from "@/data/catalog";

export const metadata: Metadata = { title: "New Arrivals" };

/** Cùng bố cục với /san-pham: sản phẩm mới (nhãn admin gán) trước, tất cả sản phẩm phía sau. */
export default function NewArrivalsPage() {
    return (
        <CatalogPage
            collection={newArrivalsCollection}
            newProducts={getNewProducts()}
            products={getProductsExceptNew("tat-ca")}
            crumbs={[{ label: "New Arrivals" }]}
        />
    );
}