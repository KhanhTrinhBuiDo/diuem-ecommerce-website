import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/product/ProductDetailPage";
import { collections, getCollection } from "@/data/catalog";
import { getProductDetail, productDetails, productHref, sampleCard } from "@/data/products";

/** Chỉ các cặp (danh mục × sản phẩm) có trong data mới có trang; còn lại 404. */
export const dynamicParams = false;

type Params = { collection: string; slug: string };

export function generateStaticParams(): Params[] {
  return collections.flatMap((c) => productDetails.map((p) => ({ collection: c.slug, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = getProductDetail((await params).slug);
  return { title: p?.name ?? "Sản phẩm" };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { collection: cslug, slug } = await params;
  const collection = getCollection(cslug);
  const product = getProductDetail(slug);
  if (!collection || !product) notFound();

  // TODO(supabase): gợi ý theo danh mục/tag thật. Hiện dùng thẻ mẫu.
  const suggestions = [1, 2, 3].map((i) => sampleCard(`sg-${i}`, collection.slug));
  const related = [1, 2, 3, 4].map((i) => sampleCard(`rl-${i}`, collection.slug));

  return <ProductDetailPage product={product} collection={collection} href={productHref(collection.slug, product.slug)} suggestions={suggestions} related={related} />;
}
