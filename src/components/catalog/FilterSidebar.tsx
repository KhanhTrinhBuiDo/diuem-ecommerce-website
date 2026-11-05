"use client";

import { useState } from "react";

/**
 * Bộ lọc (Figma Bộ lọc, 346px): tiêu đề + "N kết quả", đường kẻ, 4 mục xổ xuống.
 * TODO(filter): Figma chưa có nội dung tùy chọn bên trong từng mục → đang hiện placeholder.
 *   Khi có dữ liệu: Dòng sản phẩm, Dung tích, Giá (khoảng), Phù hợp với → lọc theo query string hoặc Supabase.
 * Mobile: thu gọn, bấm "Bộ lọc" để mở.
 */
const FILTERS = [
  { id: "line", label: "Dòng sản phẩm" },
  { id: "size", label: "Dung tích" },
  { id: "price", label: "Giá" },
  { id: "for", label: "Phù hợp với" },
];

export function FilterSidebar({ total }: { total: number }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside aria-label="Bộ lọc sản phẩm" className="w-full flex-none bg-white lg:w-[346px]">
      <div className="flex items-center justify-between gap-4 px-6 pb-2.5 pt-6 lg:gap-[119px] lg:pl-[50px] lg:pr-[30px] lg:pt-[50px]">
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="filter-list"
          onClick={() => setMobileOpen((v) => !v)}
          className="text-xl font-normal leading-[1.25] lg:pointer-events-none"
        >
          Bộ lọc
        </button>
        <span className="text-base font-extralight leading-5">{total} kết quả</span>
      </div>

      <div id="filter-list" className={`${mobileOpen ? "block" : "hidden"} lg:block`}>
        <div className="px-6 py-2.5 lg:pl-[50px] lg:pr-[30px]">
          <div className="h-0 border-t border-black" />
        </div>
        <ul>
          {FILTERS.map((f) => {
            const open = openId === f.id;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : f.id)}
                  className="flex h-10 w-full items-center justify-between gap-[54px] px-6 py-2.5 text-left transition-colors hover:text-brand lg:pl-[50px] lg:pr-[30px]"
                >
                  <span className="text-base font-extralight leading-5">{f.label}</span>
                  <svg width="11" height="6" viewBox="0 0 11 6" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true" className={`flex-none transition-transform ${open ? "rotate-180" : ""}`}>
                    <path d="M.5.5 5.5 5.5 10.5.5" />
                  </svg>
                </button>
                {open && <p className="px-6 pb-3 text-sm font-extralight text-black/60 lg:pl-[50px] lg:pr-[30px]">Tùy chọn lọc sẽ hiển thị khi có dữ liệu sản phẩm.</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
