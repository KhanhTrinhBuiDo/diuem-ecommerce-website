"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useAdminBase } from "@/components/admin/AdminBase";
import { AdminNav } from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/ui/LogoMark";

/**
 * Khung trang quản trị: thanh trên (logo, "Xem cửa hàng", tài khoản admin) + menu trái 280px.
 * Mobile: menu trượt ra bằng nút ☰.
 */
export function AdminShell({ children, name, email }: { children: ReactNode; name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const base = useAdminBase();
  async function signOut() {
    try { await createClient().auth.signOut(); } finally { window.location.assign("/"); }
  }
  return (
    <div className="min-h-screen bg-[#f6f4f5]">
      <header className="sticky top-0 z-30 border-b-[6px] border-line bg-white">
        <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Mở menu quản trị" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="grid size-10 place-items-center rounded-full border-2 border-black lg:hidden">
              <svg width="18" height="14" viewBox="0 0 18 14" stroke="#000" strokeWidth="2" aria-hidden="true">
                <path d="M0 1h18M0 7h18M0 13h18" />
              </svg>
            </button>
            <Link href={base} className="flex items-center gap-3">
              <LogoMark className="h-9 w-10" />
              <span className="leading-tight">
                <span className="block text-sm font-bold">Dịu Em</span>
                <span className="block text-[11px] font-light text-black/60">Quản trị</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" target="_blank" className="hidden rounded-full border-2 border-black px-4 py-1.5 font-medium hover:bg-black hover:text-white sm:inline-block">
              Xem cửa hàng
            </Link>
            <span className="hidden text-right leading-tight sm:block">
              <span className="block font-bold">{name}</span>
              <span className="block text-[11px] font-light text-black/60">{email}</span>
            </span>
            <button type="button" onClick={signOut} className="rounded-full bg-black px-4 py-1.5 font-bold text-white hover:opacity-80">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1700px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className={`${open ? "block" : "hidden"} lg:block`}>
          <div className="rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)] lg:sticky lg:top-[88px]">
            <AdminNav onNavigate={() => setOpen(false)} />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
