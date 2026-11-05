"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { getProducts } from "@/data/catalog";
import { megaMenu, type MenuGroup } from "@/data/menu";
import type { NavLink } from "@/config/site";

const link = "whitespace-nowrap text-center text-[clamp(14px,1.27vw,22px)] font-normal leading-[1.23] text-black transition-colors hover:text-brand";

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className={className}>
      <path d="M1 1l6 6-6 6" />
    </svg>
  );
}

/**
 * Nav chính (desktop). Mục "SẢN PHẨM" mở mega menu khi rê chuột/focus (Figma "Noti - Xem Sản phẩm"):
 * - Chế độ 1: các nhóm danh mục + 2 ảnh + "XEM TẤT CẢ".
 * - Chế độ 2 (rê vào tiêu đề nhóm): 4 sản phẩm của nhóm + "XEM TẤT CẢ >".
 * Phím Esc đóng menu.
 */
export function NavMenu({ items }: { items: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<MenuGroup | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const wrap = useRef<HTMLDivElement>(null);

  const show = () => {
    window.clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setOpen(false);
      setGroup(null);
    }, 120);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setGroup(null);
      }
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <nav aria-label="Menu chính" className="hidden items-center gap-[clamp(20px,2.9vw,50px)] lg:flex">
      {items.map((item) =>
        item.href === "/san-pham" ? (
          <div
            key={item.href}
            ref={wrap}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={(e) => {
              if (!wrap.current?.contains(e.relatedTarget as Node)) hide();
            }}
          >
            <Link href={item.href} aria-haspopup="true" aria-expanded={open} className={link}>
              {item.label}
            </Link>
            {open && (
              <div className="absolute inset-x-0 top-full z-50 pt-0">
                <div className="mx-auto w-[min(1536px,calc(100%-100px))] rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                  {group ? <ProductsView group={group} onClose={() => setGroup(null)} /> : <GroupsView onGroup={setGroup} />}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link key={item.href} href={item.href} className={link}>
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}

function GroupsView({ onGroup }: { onGroup: (g: MenuGroup) => void }) {
  return (
    <div className="flex gap-[50px] p-[clamp(24px,2.1vw,36px)] pb-8">
      <div className="flex min-w-0 flex-1 flex-col gap-[50px]">
        {megaMenu.rows.map((row, i) => (
          <div key={i} className="grid grid-cols-3 gap-[50px]">
            {row.map((g) => (
              <div key={g.label} className="flex flex-col gap-5">
                <Link href={g.href} onMouseEnter={() => onGroup(g)} onFocus={() => onGroup(g)} className="flex items-center gap-4 text-[clamp(16px,1.27vw,22px)] font-bold leading-[27px] hover:text-brand">
                  {g.label}
                  <Chevron />
                </Link>
                <ul className="flex flex-col gap-[15px]">
                  {g.items.map((it) => (
                    <li key={it.label}>
                      <Link href={it.href} className="text-[clamp(14px,1.04vw,18px)] font-light leading-[22px] hover:text-brand">
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
        <Link href={megaMenu.viewAll.href} className="self-start text-[clamp(16px,1.27vw,22px)] font-bold text-line underline">
          {megaMenu.viewAll.label}
        </Link>
      </div>
      <div className="hidden w-[320px] flex-none flex-col gap-[50px] xl:flex">
        <ImageOrPlaceholder src={null} alt="" label="Ảnh menu 1 · 320×262" className="h-[262px]" />
        <ImageOrPlaceholder src={null} alt="" label="Ảnh menu 2 · 320×262" className="h-[262px]" />
      </div>
    </div>
  );
}

function ProductsView({ group, onClose }: { group: MenuGroup; onClose: () => void }) {
  const products = getProducts(group.collection, 4);
  return (
    <div className="p-[clamp(24px,2.1vw,36px)]" onMouseLeave={onClose}>
      <Link href={group.href} className="mb-5 inline-flex items-center gap-4 text-[clamp(16px,1.27vw,22px)] font-bold leading-[27px] hover:text-brand">
        XEM TẤT CẢ
        <Chevron />
      </Link>
      <ul className="grid grid-cols-4 gap-[clamp(16px,2vw,34px)]">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={p.href} className="group flex flex-col gap-[30px]">
              <ImageOrPlaceholder src={p.image} alt={p.name} label="Ảnh sản phẩm" sizes="303px" className="aspect-[303/450] rounded-[20px]" />
              <span className="text-[clamp(14px,1.16vw,20px)] font-extralight uppercase leading-[25px] group-hover:text-brand">{p.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
