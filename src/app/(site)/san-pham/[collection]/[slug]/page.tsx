import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/product/ProductDetailPage";
import { getProductReviews } from "@/lib/reviews";
import { getCatalog, hrefOf, related, resolveCollection, toCard, toDetail, topCategory } from "@/lib/storefront";

export const revalidate = 60;

type Params = { collection: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getCatalog()).products.find((x) => x.slug === slug);
  return { title: p?.name ?? "Sản phẩm", description: p?.shortDescription.slice(0, 160) || undefined };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const cat = await getCatalog();
  const p = cat.products.find((x) => x.slug === slug);
  if (!p) notFound();
  // Breadcrumb luôn theo danh mục cha thật của sản phẩm (URL cũ/sai danh mục vẫn mở được)
  const collection = resolveCollection(cat, topCategory(p).slug)!.collection;
  const near = related(cat.products, p, 4).map(toCard);
  const { reviews, average } = await getProductReviews(p.id);
  return <ProductDetailPage product={toDetail(p)} collection={collection} href={hrefOf(p)} suggestions={near.slice(0, 3)} related={near} reviews={reviews} average={average} />;
}
