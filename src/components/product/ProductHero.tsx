"use client";

import { useState } from "react";
import type { Product } from "@/components/home/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { defaultVariant, type ProductDetail } from "@/data/products";

/** Phần đầu trang chi tiết: gallery + thông tin dùng chung size đang chọn (đổi size → ảnh đổi theo). */
export function ProductHero({ product, href, rating, suggestions }: { product: ProductDetail; href: string; rating: number; suggestions: Product[] }) {
  const [variantId, setVariantId] = useState(defaultVariant(product).id);
  const focus = product.variants.find((v) => v.id === variantId)?.images?.[0] ?? null;
  return (
    <>
      <ProductGallery images={product.images} name={product.name} focus={focus} />
      <ProductInfo product={product} href={href} rating={rating} suggestions={suggestions} variantId={variantId} onVariant={setVariantId} />
    </>
  );
}
