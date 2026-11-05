"use client";

import Link from "next/link";
import { priceOf, useCart, type CartItem } from "@/components/cart/CartProvider";
import { Checkbox } from "@/components/ui/Checkbox";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { Stepper } from "@/components/ui/Stepper";
import { TrashIcon } from "@/components/ui/icons2";
import { formatVND } from "@/lib/format";

/** Một dòng sản phẩm trong giỏ (Figma "item"): ô chọn, ảnh, tên, dung tích, số lượng, giá, Xóa. */
export function CartItemRow({ item }: { item: CartItem }) {
  const { toggle, setQty, setVariant, remove } = useCart();
  return (
    <li className="flex items-start gap-4 border-b border-black pb-5 lg:gap-5">
      <Checkbox checked={item.selected} onChange={() => toggle(item.key)} aria-label={`Chọn ${item.name}`} className="mt-[60px]" />
      <Link href={item.href} className="flex-none">
        <ImageOrPlaceholder src={item.image} alt={item.name} label="Ảnh" className="h-[160px] w-[110px] lg:h-[190px] lg:w-[130px]" sizes="130px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 flex-col gap-3">
            <Link href={item.href} className="text-[clamp(14px,1.04vw,18px)] font-medium leading-tight hover:text-brand">
              {item.name}
            </Link>
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                aria-label="Dung tích"
                value={item.variantId}
                onChange={(e) => setVariant(item.key, e.target.value)}
                className="h-[34px] rounded-full border-2 border-black bg-white px-3 text-sm font-medium"
              >
                {item.variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={!v.available && v.id !== item.variantId}>
                    {v.label}
                  </option>
                ))}
              </select>
              <Stepper variant="pill" value={item.qty} onChange={(q) => setQty(item.key, q)} />
            </div>
          </div>
          <p className="text-[clamp(14px,1.04vw,18px)] font-bold">{formatVND(priceOf(item) * item.qty)}</p>
        </div>
        <button type="button" onClick={() => remove(item.key)} className="mt-auto inline-flex w-fit items-center gap-2 text-sm font-light hover:text-brand">
          <TrashIcon className="size-4" /> Xóa
        </button>
      </div>
    </li>
  );
}
