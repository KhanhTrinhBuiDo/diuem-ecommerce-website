"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/components/home/ProductCard";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { CartPlusIcon } from "@/components/ui/icons2";
import { defaultVariant, getProductDetail } from "@/data/products";
import { formatVND } from "@/lib/format";

/** Thẻ nhỏ gợi ý (Figma Item-mini 175×284) với nút thêm nhanh vào giỏ. */
export function MiniProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  // TODO(supabase): tra theo product.id thật; hiện mọi thẻ mẫu dùng chung 1 chi tiết.
  const detail = getProductDetail("dau-goi-hoa-buoi-the-he-moi");

  return (
    <div className="flex flex-col gap-[5px]">
      <div className="relative">
        <Link href={product.href} aria-label={product.name}>
          <ImageOrPlaceholder src={product.image} alt={product.name} label="Ảnh" className="aspect-[175/236] w-full" sizes="175px" />
        </Link>
        {detail && (
          <button
            type="button"
            onClick={() => add({ productId: product.id, name: product.name, image: product.image, href: product.href, variants: detail.variants, variantId: defaultVariant(detail).id })}
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
            className="absolute bottom-2.5 right-2.5 grid size-[41px] place-items-center rounded-full border border-white bg-[#131313]/20 text-white transition-colors hover:bg-black"
          >
            <CartPlusIcon className="size-5" />
          </button>
        )}
      </div>
      <Link href={product.href} className="truncate text-[15px] font-light leading-[19px] hover:text-brand">
        {product.name}
      </Link>
      <p className="text-[15px] font-bold leading-[19px]">{formatVND(product.price)}</p>
    </div>
  );
}
