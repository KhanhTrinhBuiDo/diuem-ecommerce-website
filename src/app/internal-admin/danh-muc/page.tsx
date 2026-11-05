import { requireAdmin } from "@/lib/admin-auth";
import { listCategories } from "@/lib/admin-data";
import { CategoriesAdmin } from "@/components/admin/SimpleManagers";

export const dynamic = "force-dynamic";
export const metadata = { title: "Danh mục" };

export default async function Page() {
  await requireAdmin();
  return <CategoriesAdmin categories={await listCategories()} />;
}
