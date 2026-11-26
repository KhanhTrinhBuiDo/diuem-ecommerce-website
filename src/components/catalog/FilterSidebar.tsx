"use client";

import { useState } from "react";
import { hasAny, type FilterKey, type Option, type Selected } from "@/lib/catalog-filters";

/**
 * Bộ lọc (Figma Bộ lọc, 346px): tiêu đề + "N kết quả", đường kẻ, 4 mục xổ xuống (tick chọn nhiều).
 * Lọc ngay trên trình duyệt (xem src/lib/catalog-filters.ts). Mobile: thu gọn, bấm "Bộ lọc" để mở.
 */
const FILTERS: { id: FilterKey; label: string }[] = [
  { id: "line", label: "Dòng sản phẩm" },
  { id: "size", label: "Dung tích" },
  { id: "price", label: "Giá" },
  { id: "for", label: "Phù hợp với" },
];

type Props = { total: number; facets: Record<FilterKey, Option[]>; selected: Selected; onToggle: (k: FilterKey, id: string) => void; onClear: () => void };

export function FilterSidebar({ total, facets, selected, onToggle, onClear }: Props) {
  const [openId, setOpenId] = useState<FilterKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside aria-label="Bộ lọc sản phẩm" className="w-full flex-none bg-white lg:w-[346px]">
      <div className="flex items-center justify-between gap-4 px-6 pb-2.5 pt-6 lg:gap-[119px] lg:pl-[50px] lg:pr-[30px] lg:pt-[50px]">
        <button type="button" aria-expanded={mobileOpen} aria-controls="filter-list" onClick={() => setMobileOpen((v) => !v)} className="text-xl font-normal leading-[1.25] lg:pointer-events-none">
          Bộ lọc
        </button>
        <span role="status" className="text-base font-extralight leading-5">{total} kết quả</span>
      </div>

      <div id="filter-list" className={`${mobileOpen ? "block" : "hidden"} lg:block`}>
        <div className="px-6 py-2.5 lg:pl-[50px] lg:pr-[30px]">
          <div className="h-0 border-t border-black" />
        </div>
        <ul>
          {FILTERS.filter((f) => facets[f.id].length > 0).map((f) => {
            const open = openId === f.id;
            const n = selected[f.id].length;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : f.id)}
                  className="flex h-10 w-full items-center justify-between gap-[54px] px-6 py-2.5 text-left transition-colors hover:text-brand lg:pl-[50px] lg:pr-[30px]"
                >
                  <span className="text-base font-extralight leading-5">
                    {f.label}
                    {n > 0 && <span className="ml-2 rounded-full bg-black px-2 py-0.5 text-xs font-bold text-white">{n}</span>}
                  </span>
                  <svg width="11" height="6" viewBox="0 0 11 6" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true" className={`flex-none transition-transform ${open ? "rotate-180" : ""}`}>
                    <path d="M.5.5 5.5 5.5 10.5.5" />
                  </svg>
                </button>
                {open && (
                  <ul className="flex flex-col gap-2 px-6 pb-3 pt-1 lg:pl-[50px] lg:pr-[30px]">
                    {facets[f.id].map((o) => (
                      <li key={o.id}>
                        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-extralight">
                          <input type="checkbox" checked={selected[f.id].includes(o.id)} onChange={() => onToggle(f.id, o.id)} className="size-4 accent-black" />
                          <span className="flex-1">{o.label}</span>
                          <span className="text-black/50">({o.count})</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        {hasAny(selected) && (
          <div className="px-6 pb-4 pt-2 lg:pl-[50px] lg:pr-[30px]">
            <button type="button" onClick={onClear} className="text-sm underline hover:text-brand">Xóa bộ lọc</button>
          </div>
        )}
      </div>
    </aside>
  );
}
