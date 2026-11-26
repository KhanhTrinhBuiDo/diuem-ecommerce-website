import Link from "next/link";
import type { Product } from "@/components/home/ProductCard";
import { QuickAdd } from "@/components/product/QuickAdd";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { formatVND } from "@/lib/format";

/** Thẻ nhỏ gợi ý (Figma Item-mini 175×284); rê chuột để chọn size và thêm nhanh vào giỏ. */
export function MiniProductCard({ product }: { product: Product }) {
  return (
    <div className="group group/qa flex flex-col gap-[5px]">
      <div className="relative">
        <Link href={product.href} aria-label={product.name} className="block">
          <ImageOrPlaceholder src={product.image} alt={product.name} label="Ảnh" className="aspect-[175/236] w-full" sizes="175px" />
        </Link>
        <QuickAdd product={product} compact />
      </div>
      <Link href={product.href} className="truncate text-[15px] font-light leading-[19px] hover:text-brand">
        {product.name}
      </Link>
      <p className="text-[15px] font-bold leading-[19px]">{formatVND(product.price)}</p>
    </div>
  );
}
