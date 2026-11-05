import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { collections, getCollection, getProducts } from "@/data/catalog";

/** Chỉ các danh mục trong data/catalog.ts có trang; slug khác → 404. */
export const dynamicParams = false;

type Params = { collection: string };

export function generateStaticParams(): Params[] {
  return collections.map((c) => ({ collection: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const c = getCollection((await params).collection);
  return { title: c?.name ?? "Sản phẩm" };
}

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const collection = getCollection((await params).collection);
  if (!collection) notFound();
  return (
    <CatalogPage
      collection={collection}
      products={getProducts(collection.slug)}
      crumbs={[{ label: "Sản phẩm", href: "/san-pham" }, { label: collection.name }]}
    />
  );
}
