"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { siteImage } from "@/data/site-images";
import type { Product } from "@/components/home/ProductCard";
import { megaMenu } from "@/data/menu";
import type { NavLink } from "@/config/site";

const link = "whitespace-nowrap text-center text-[clamp(14px,calc(var(--vw)*1.27),22px)] font-normal leading-[1.23] text-black transition-colors hover:text-brand";

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className={className}>
      <path d="M1 1l6 6-6 6" />
    </svg>
  );
}

type Key = "products" | "new";

/**
 * Nav chính (desktop). Hai mega menu độc lập, mỗi menu chỉ mở khi rê chuột/focus đúng mục của nó (Esc đóng):
 * - "SẢN PHẨM" → danh mục (chăm sóc mặt/tóc/cơ thể...) + 2 ảnh + "XEM TẤT CẢ" (Figma "Noti - Xem Sản phẩm", chế độ 1).
 * - "NEW ARRIVALS" → các sản phẩm mới do admin gán nhãn + "XEM TẤT CẢ >" (chế độ 2 của Figma).
 */
export function NavMenu({ items, newProducts }: { items: NavLink[]; newProducts: Product[] }) {
  const [open, setOpen] = useState<Key | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const wraps = useRef<Partial<Record<Key, HTMLDivElement | null>>>({});

  const show = (k: Key) => {
    window.clearTimeout(timer.current);
    setOpen(k);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(null), 350); // đủ thời gian rê chuột xuống menu, không tắt vụt
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  const keyOf = (href: string): Key | null => (href === "/san-pham" ? "products" : href === "/new-arrivals" ? "new" : null);

  return (
    <nav aria-label="Menu chính" className="hidden items-center gap-[clamp(20px,calc(var(--vw)*2.9),50px)] lg:flex">
      {items.map((item) => {
        const k = keyOf(item.href);
        if (!k) {
          return (
            <Link key={item.href} href={item.href} className={link}>
              {item.label}
            </Link>
          );
        }
        return (
          <div
            key={item.href}
            ref={(el) => { wraps.current[k] = el; }}
            onMouseEnter={() => show(k)}
            onMouseLeave={hide}
            onFocus={() => show(k)}
            onBlur={(e) => {
              if (!wraps.current[k]?.contains(e.relatedTarget as Node)) hide();
            }}
          >
            <Link href={item.href} aria-haspopup="true" aria-expanded={open === k} className={link}>
              {item.label}
            </Link>
            {open === k && (
              <div className="absolute inset-x-0 top-full z-50 pt-0">
                <div className="mx-auto w-[min(1536px,calc(100%-100px))] rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                  {k === "products" ? <GroupsView /> : <NewArrivalsView href={item.href} products={newProducts} onNavigate={() => setOpen(null)} />}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function GroupsView() {
  return (
    <div className="flex gap-[50px] p-[clamp(24px,calc(var(--vw)*2.1),36px)] pb-8">
      <div className="flex min-w-0 flex-1 flex-col gap-[50px]">
        {megaMenu.rows.map((row, i) => (
          <div key={i} className="grid grid-cols-3 gap-[50px]">
            {row.map((g) => (
              <div key={g.label} className="flex flex-col gap-5">
                <Link href={g.href} className="flex items-center gap-4 text-[clamp(16px,calc(var(--vw)*1.27),22px)] font-bold leading-[27px] hover:text-brand">
                  {g.label}
                  <Chevron />
                </Link>
                <ul className="flex flex-col gap-[15px]">
                  {g.items.map((it) => (
                    <li key={it.label}>
                      <Link href={it.href} className="text-[clamp(14px,calc(var(--vw)*1.04),18px)] font-light leading-[22px] hover:text-brand">
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
        <Link href={megaMenu.viewAll.href} className="self-start text-[clamp(16px,calc(var(--vw)*1.27),22px)] font-bold text-line underline">
          {megaMenu.viewAll.label}
        </Link>
      </div>
      <div className="hidden w-[320px] flex-none flex-col gap-[50px] xl:flex">
        <ImageOrPlaceholder src={siteImage("header/menu-1")} alt="" label="Ảnh menu 1 · 320×262" className="h-[262px]" />
        <ImageOrPlaceholder src={siteImage("header/menu-2")} alt="" label="Ảnh menu 2 · 320×262" className="h-[262px]" />
      </div>
    </div>
  );
}

function NewArrivalsView({ href, products, onNavigate }: { href: string; products: Product[]; onNavigate: () => void }) {
  return (
    <div className="p-[clamp(24px,calc(var(--vw)*2.1),36px)]">
      <Link href={href} onClick={onNavigate} className="mb-5 inline-flex items-center gap-4 text-[clamp(16px,calc(var(--vw)*1.27),22px)] font-bold leading-[27px] hover:text-brand">
        XEM TẤT CẢ SẢN PHẨM MỚI
        <Chevron />
      </Link>
      <ul className="grid grid-cols-4 gap-[clamp(16px,calc(var(--vw)*2),34px)]">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={p.href} onClick={onNavigate} className="group flex flex-col gap-[30px]">
              <ImageOrPlaceholder src={p.image} alt={p.name} label="Ảnh sản phẩm" sizes="303px" className="aspect-[303/450] rounded-[20px]" />
              <span className="text-[clamp(14px,calc(var(--vw)*1.16),20px)] font-extralight uppercase leading-[25px] group-hover:text-brand">{p.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
