import { requireAdmin } from "@/lib/admin-auth";
import { listCategories, listProducts } from "@/lib/admin-data";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sản phẩm" };

export default async function Page() {
  await requireAdmin();
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  return <ProductsAdmin products={products} categories={categories} />;
}
