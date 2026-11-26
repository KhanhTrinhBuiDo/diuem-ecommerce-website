"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/components/home/ProductCard";
import { CartPlusIcon } from "@/components/ui/icons2";

/**
 * Lớp phủ "Thêm vào giỏ hàng" trên ảnh thẻ sản phẩm: rê chuột (hoặc tab bàn phím) vào thẻ → hiện các size để thêm nhanh.
 * Size hết hàng: xám + cấm chọn. Thiết bị cảm ứng (không có hover): hiện nút giỏ nhỏ để mở/đóng bảng size.
 * Đặt trong phần tử `relative` của ảnh; thẻ cha phải có class `group/qa`.
 */
export function QuickAdd({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  const variants = product.variants;
  if (!variants?.length) return null;

  const show = open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0 group-hover/qa:pointer-events-auto group-hover/qa:opacity-100 group-focus-within/qa:pointer-events-auto group-focus-within/qa:opacity-100";
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Chọn size để thêm ${product.name} vào giỏ hàng`}
        onClick={() => setOpen((v) => !v)}
        className="absolute bottom-2.5 right-2.5 hidden size-10 place-items-center rounded-full border border-white bg-black/30 text-white [@media(hover:none)]:grid"
      >
        <CartPlusIcon className="size-5" />
      </button>
      <div
        role="group"
        aria-label={`Thêm ${product.name} vào giỏ hàng`}
        className={`absolute inset-x-2.5 bottom-2.5 flex flex-col items-center rounded-[10px] bg-black/45 text-white backdrop-blur-[3px] transition-opacity duration-200 ${compact ? "gap-1.5 p-2" : "gap-2.5 p-3.5"} ${show} ${open ? "[@media(hover:none)]:bottom-14" : ""}`}
      >
        <p className={`${compact ? "text-xs" : "text-[clamp(14px,1.04vw,18px)]"} font-light leading-tight`}>Thêm vào giỏ hàng</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={!v.available}
              title={v.available ? undefined : "Hết hàng"}
              aria-label={`${v.label}${v.available ? "" : " (hết hàng)"}`}
              onClick={() => {
                add({ productId: product.id, name: product.name, image: v.images?.[0] ?? product.image, href: product.href, variants, variantId: v.id });
                setOpen(false);
              }}
              className={`max-w-full truncate rounded-full font-medium transition-colors ${compact ? "h-6 px-2.5 text-[11px]" : "h-8 px-4 text-sm"} ${
                v.available ? "bg-white/80 text-black hover:bg-white" : "cursor-not-allowed bg-white/25 text-white/50"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
