"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { formatVND } from "@/lib/format";

/** Popup "Thêm vào giỏ hàng thành công" (Figma "Noti - Thêm vào giỏ hàng"): góc phải trên, tự ẩn sau 5 giây. */
export function CartToast() {
  const { lastAdded, dismissAdded } = useCart();
  useEffect(() => {
    if (!lastAdded) return;
    const t = window.setTimeout(dismissAdded, 5000);
    return () => window.clearTimeout(t);
  }, [lastAdded, dismissAdded]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 top-[88px] z-[60] flex justify-end lg:inset-x-auto lg:right-[calc(max(0px,(100vw-1728px)/2)+96px)] lg:top-[150px]">
      {lastAdded && (
        <div className="pointer-events-auto flex w-full flex-col gap-[25px] rounded-[20px] bg-white p-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.25)] sm:w-[513px]">
          <div className="flex flex-col gap-[15px]">
            <div className="flex flex-col items-end">
              <button type="button" aria-label="Đóng thông báo" onClick={dismissAdded} className="grid size-[14px] place-items-center">
                <svg width="14" height="14" viewBox="0 0 14 14" stroke="#000" strokeWidth="2" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
              <div className="flex w-full flex-col gap-5">
                <p className="text-[clamp(15px,1.04vw,18px)] font-medium leading-[22px]">Thêm vào giỏ hàng thành công</p>
                <span aria-hidden="true" className="block h-[3px] bg-[#b2b2b2]" />
              </div>
            </div>
            <div className="flex items-center gap-[19px]">
              <ImageOrPlaceholder src={lastAdded.image} alt="" label="" sizes="80px" className="size-20 flex-none" />
              <div className="flex min-w-0 flex-col justify-between gap-2.5">
                <p className="text-[clamp(15px,1.04vw,18px)] leading-[22px]">{lastAdded.name}</p>
                <p className="text-[15px] font-light leading-[19px]">{lastAdded.variantLabel}</p>
                <p className="flex items-center gap-2.5 text-[15px] leading-[19px]">
                  <span className="font-light">{lastAdded.qty}</span>
                  <span className="font-light">x</span>
                  <strong className="font-bold">{formatVND(lastAdded.price)}</strong>
                </p>
              </div>
            </div>
          </div>
          <Link href="/gio-hang" onClick={dismissAdded} className="grid h-[39px] w-[236px] max-w-full place-items-center rounded-full border border-black text-[15px] font-bold hover:bg-black hover:text-white">
            Xem giỏ hàng
          </Link>
        </div>
      )}
    </div>
  );
}
