"use client";

import { useMemo, useState } from "react";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import type { Product } from "@/components/home/ProductCard";
import { buildFacets, emptySelected, hasAny, matches, type FilterKey, type Selected } from "@/lib/catalog-filters";

/** Bộ lọc + lưới sản phẩm của trang danh mục. Lọc áp cho cả khối "Sản phẩm mới" và "Tất cả sản phẩm". */
export function CatalogBrowser({ products, newProducts }: { products: Product[]; newProducts?: Product[] }) {
  const [sel, setSel] = useState<Selected>(emptySelected);
  const all = useMemo(() => [...(newProducts ?? []), ...products], [products, newProducts]);
  const facets = useMemo(() => buildFacets(all), [all]);
  const fMain = useMemo(() => products.filter((p) => matches(p, sel)), [products, sel]);
  const fNew = useMemo(() => (newProducts ?? []).filter((p) => matches(p, sel)), [newProducts, sel]);
  const sig = JSON.stringify(sel); // đổi bộ lọc → lưới về trang đầu

  const toggle = (k: FilterKey, id: string) => setSel((s) => ({ ...s, [k]: s[k].includes(id) ? s[k].filter((x) => x !== id) : [...s[k], id] }));
  const empty = hasAny(sel) && fMain.length + fNew.length === 0;

  return (
    <div className="flex flex-col lg:flex-row lg:items-start">
      <FilterSidebar total={fMain.length + fNew.length} facets={facets} selected={sel} onToggle={toggle} onClear={() => setSel(emptySelected())} />
      {empty ? (
        <div className="min-w-0 flex-1 px-6 py-16 text-center lg:pr-[50px]">
          <p className="font-light">Không có sản phẩm nào phù hợp với bộ lọc.</p>
          <button type="button" onClick={() => setSel(emptySelected())} className="mt-4 rounded-full bg-black px-8 py-3 font-bold text-white hover:opacity-80">Xóa bộ lọc</button>
        </div>
      ) : newProducts?.length && fNew.length ? (
        <div className="min-w-0 flex-1">
          <ProductGrid key={`n${sig}`} products={fNew} pageSize={8} title="SẢN PHẨM MỚI" id="san-pham-moi" />
          {fMain.length > 0 && <ProductGrid key={`a${sig}`} products={fMain} title="TẤT CẢ SẢN PHẨM" id="tat-ca-san-pham" />}
        </div>
      ) : (
        <ProductGrid key={sig} products={fMain} />
      )}
    </div>
  );
}
