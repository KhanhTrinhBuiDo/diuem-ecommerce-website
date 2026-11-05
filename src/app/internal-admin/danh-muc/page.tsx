import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/Managers";

export const metadata: Metadata = { title: "Danh mục" };

export default function Page() {
  return <CategoriesManager />;
}
