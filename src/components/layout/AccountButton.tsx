"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuthModal } from "@/components/auth/AuthProvider";
import { UserIcon } from "@/components/ui/icons";

/**
 * Icon tài khoản + menu nhỏ (Figma "Noti - Tài khoản"): Tài khoản của bạn / Tra cứu đơn hàng / Câu hỏi thường gặp.
 * TODO(figma): mục thứ 3 trong Figma ghi "Chính sách Câu hỏi thường gặp" – đang dùng "Câu hỏi thường gặp".
 * Hàng cuối (Đăng nhập / Đăng xuất) không có trong Figma – thêm để dùng được với Supabase Auth.
 * TODO(auth): chưa đăng nhập → "Tài khoản của bạn" nên mở popup đăng nhập; trang /tai-khoan vẫn hiện dữ liệu mẫu.
 */
export function AccountButton() {
  const { open: openAuth, user, adminHref, signOut } = useAuthModal();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const row = "block py-1 text-[clamp(15px,1.04vw,18px)] font-light leading-[22px] hover:text-brand";
  const rule = <span aria-hidden="true" className="block h-1 bg-line" />;
  return (
    <div ref={ref} className="relative" onMouseEnter={() => window.matchMedia("(hover:hover)").matches && setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-label="Tài khoản" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="grid size-10 place-items-center transition-colors hover:text-brand">
        <UserIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 pt-2">
          <div className="relative w-[min(340px,calc(100vw-32px))] rounded-[20px] bg-white px-[33px] py-8 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <span aria-hidden="true" className="absolute -top-2 right-[18px] size-5 rotate-45 bg-white" />
            <div role="menu" className="relative flex flex-col gap-2.5">
              {adminHref && (
                <>
                  <Link role="menuitem" href={adminHref} onClick={() => setOpen(false)} className={`${row} font-bold text-brand`}>Trang quản trị (Dashboard)</Link>
                  {rule}
                </>
              )}
              <Link role="menuitem" href="/tai-khoan/ho-so" onClick={() => setOpen(false)} className={row}>Tài khoản của bạn</Link>
              {rule}
              <Link role="menuitem" href="/tra-cuu-don-hang" onClick={() => setOpen(false)} className={row}>Tra cứu đơn hàng</Link>
              {rule}
              <Link role="menuitem" href="/tai-khoan/cau-hoi-thuong-gap" onClick={() => setOpen(false)} className={row}>Câu hỏi thường gặp</Link>
              {rule}
              {user ? (
                <button role="menuitem" type="button" onClick={() => { setOpen(false); void signOut(); }} className={`${row} text-left`}>
                  Đăng xuất{user.name ? ` (${user.name})` : ""}
                </button>
              ) : (
                <button role="menuitem" type="button" onClick={() => { setOpen(false); openAuth("login"); }} className={`${row} text-left`}>
                  Đăng nhập / Đăng ký
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}