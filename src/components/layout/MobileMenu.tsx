"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { SearchBox } from "@/components/layout/SearchBox";
import type { NavLink } from "@/config/site";

/** Menu cho màn hình < lg: nút hamburger + ngăn kéo gồm tìm kiếm và các link chính. */
export function MobileMenu({ items }: { items: NavLink[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Đóng menu" : "Mở menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="grid size-10 place-items-center"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-full z-50 border-t border-rule bg-white px-4 pb-6 pt-4 shadow-lg">
          <SearchBox id="mobile-search" className="flex w-full" />
          <nav aria-label="Menu di động" className="mt-5 flex flex-col">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-rule py-4 text-lg font-normal hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
