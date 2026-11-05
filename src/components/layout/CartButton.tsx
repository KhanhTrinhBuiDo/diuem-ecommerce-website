"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { BagIcon } from "@/components/ui/icons";
import { utilityLinks } from "@/config/site";

/** Icon giỏ hàng trên header, có huy hiệu số lượng. */
export function CartButton() {
  const { count, ready } = useCart();
  const n = ready ? count : 0;
  return (
    <Link href={utilityLinks.cart.href} aria-label={n ? `Giỏ hàng, ${n} sản phẩm` : "Giỏ hàng"} className="relative grid size-10 place-items-center transition-colors hover:text-brand">
      <BagIcon />
      {n > 0 && (
        <span aria-hidden="true" className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold leading-5 text-white">
          {n > 99 ? "99+" : n}
        </span>
      )}
    </Link>
  );
}
