import type { Metadata } from "next";
import { ProductsManager } from "@/components/admin/Managers";

export const metadata: Metadata = { title: "Sản phẩm" };

export default function Page() {
  return <ProductsManager />;
}
