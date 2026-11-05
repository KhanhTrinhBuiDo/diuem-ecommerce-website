"use client";

import { useState } from "react";
import { ProductCard, type Product } from "@/components/home/ProductCard";
import { ArrowRight } from "@/components/ui/ArrowRight";

/**
 * Lưới sản phẩm (Figma Item-list): 4 cột (2 cột trên mobile), thẻ 305×451, cách nhau 41px.
 * Nút "XEM THÊM →" (nền đen, 294×47) tải thêm `pageSize` sản phẩm; dòng "Hiển thị X trên tổng số N sản phẩm".
 * Hiện tải thêm ngay trên trình duyệt từ danh sách đã có.
 * TODO(supabase): khi có database, đổi sang phân trang phía server (limit/offset) thay vì cắt mảng.
 */
export function ProductGrid({ products, pageSize = 12 }: { products: Product[]; pageSize?: number }) {
  const [visible, setVisible] = useState(pageSize);
  const total = products.length;
  const shown = Math.min(visible, total);

  return (
    <div className="min-w-0 flex-1 px-6 pb-[50px] lg:pl-5 lg:pr-[50px]">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 pt-6 lg:grid-cols-4 lg:gap-x-[clamp(20px,2.4vw,41px)] lg:gap-y-[50px] lg:pt-[50px]">
        {products.slice(0, shown).map((p) => (
          <li key={p.id}>
            <ProductCard product={p} variant="catalog" />
          </li>
        ))}
      </ul>

      <div className="mt-[50px] flex flex-col items-center gap-5">
        {shown < total && (
          <button
            type="button"
            onClick={() => setVisible((v) => Math.min(v + pageSize, total))}
            className="inline-flex h-[47px] w-[294px] max-w-full items-center justify-center gap-2.5 rounded-full border border-white bg-black p-2.5 text-[clamp(16px,1.27vw,22px)] font-medium text-white transition-opacity hover:opacity-80"
          >
            XEM THÊM
            <ArrowRight width={30} />
          </button>
        )}
        <p aria-live="polite" className="text-center text-[clamp(14px,1.27vw,22px)] font-extralight leading-tight">
          Hiển thị {shown} trên tổng số {total} sản phẩm
        </p>
      </div>
    </div>
  );
}
