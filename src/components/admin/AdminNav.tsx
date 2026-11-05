"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_INTERNAL } from "@/lib/admin-path";
import { useAdminBase } from "@/components/admin/AdminBase";

export const adminNav = [
  { group: "Tổng quan", items: [{ label: "Dashboard", href: "/" }] },
  {
    group: "Bán hàng",
    items: [
      { label: "Đơn hàng", href: "/don-hang" },
      { label: "Sản phẩm", href: "/san-pham" },
      { label: "Danh mục", href: "/danh-muc" },
      { label: "Voucher", href: "/voucher" },
    ],
  },
  {
    group: "Khách hàng & hệ thống",
    items: [
      { label: "Khách hàng", href: "/khach-hang" },
      { label: "Quản trị viên", href: "/nhan-vien" },
    ],
  },
];

/** Menu trái khu quản trị (cùng kiểu menu tài khoản: viền đen, mục đang chọn nền đen). */
export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const base = useAdminBase();
  // Khi tải thẳng URL, usePathname có thể trả đường dẫn nội bộ (đã rewrite) → chuẩn hoá về dạng tương đối.
  const rel = (path.startsWith(base) ? path.slice(base.length) : path.startsWith(ADMIN_INTERNAL) ? path.slice(ADMIN_INTERNAL.length) : path).replace(/\/$/, "") || "/";
  return (
    <nav aria-label="Quản trị" className="flex flex-col gap-5">
      {adminNav.map((g) => (
        <div key={g.group} className="flex flex-col gap-2">
          <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-black/50">{g.group}</p>
          {g.items.map((it) => {
            const href = it.href === "/" ? base : base + it.href;
            const on = it.href === "/" ? rel === "/" : rel === it.href || rel.startsWith(`${it.href}/`);
            return (
              <Link
                key={it.href}
                href={href}
                onClick={onNavigate}
                aria-current={on ? "page" : undefined}
                className={`flex h-11 items-center rounded-[10px] border-2 border-black px-4 text-sm transition-colors ${on ? "bg-black font-bold text-white" : "bg-white hover:bg-black/5"}`}
              >
                {it.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
