import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { getCatalog, resolveCollection, toCard } from "@/lib/storefront";

export const revalidate = 60;

type Params = { collection: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const r = resolveCollection(await getCatalog(), (await params).collection);
  return { title: r?.collection.name ?? "Sản phẩm" };
}

/** Danh mục lấy từ bảng storefront_categories (cha hoặc con); slug không có → 404. */
export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const r = resolveCollection(await getCatalog(), (await params).collection);
  if (!r) notFound();
  const crumbs = [{ label: "Sản phẩm", href: "/san-pham" }, ...(r.crumbParent ? [{ label: r.crumbParent.name, href: `/san-pham/${r.crumbParent.slug}` }] : []), { label: r.collection.name }];
  return <CatalogPage collection={r.collection} products={r.products.map(toCard)} crumbs={crumbs} />;
}
