import Link from "next/link";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { formatVND } from "@/lib/format";

/**
 * Kiểu dữ liệu sản phẩm tối thiểu cho thẻ sản phẩm.
 * TODO(supabase): thay bằng kiểu sinh từ database khi có bảng `products`.
 */
export type Product = {
  id: string;
  name: string;
  /** Giá (VND, số nguyên) */
  price: number;
  image: string | null;
  /** TODO(product-detail): đổi thành link trang chi tiết sản phẩm khi có */
  href: string;
};

type Props = {
  product: Product;
  /**
   * "home": Figma Item 351×506, tên tối đa 2 dòng, weight 300.
   * "catalog": Figma Item-mini 305×451, ảnh 305×381, tên 1 dòng cắt "...", weight 200.
   */
  variant?: "home" | "catalog";
};

export function ProductCard({ product, variant = "home" }: Props) {
  const catalog = variant === "catalog";
  return (
    <Link href={product.href} className="group block">
      <ImageOrPlaceholder
        src={product.image}
        alt={product.name}
        label="Ảnh sản phẩm"
        sizes="(min-width:1024px) 20vw, 50vw"
        className={`${catalog ? "aspect-[305/381.25]" : "aspect-[351/430]"} w-full transition-opacity group-hover:opacity-90`}
      />
      <h3
        className={`${catalog ? "mt-2.5 truncate font-extralight" : "mt-[13px] line-clamp-2 font-light"} text-[clamp(15px,1.16vw,20px)] leading-tight transition-colors group-hover:text-brand`}
      >
        {product.name}
      </h3>
      <p className={`${catalog ? "mt-2.5" : "mt-[13px]"} text-[clamp(15px,1.16vw,20px)] font-bold leading-tight`}>{formatVND(product.price)}</p>
    </Link>
  );
}
