"use client";

import Link from "next/link";
import { useAuthModal } from "@/components/auth/AuthProvider";

/** Hiện khi trang cần đăng nhập (đơn hàng của tôi). Khách chưa có tài khoản dùng "Tra cứu đơn hàng". */
export function LoginRequired({ what = "đơn hàng của bạn" }: { what?: string }) {
  const { open, loading } = useAuthModal();
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-[clamp(14px,1.04vw,18px)] font-light">Vui lòng đăng nhập để xem {what}.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" disabled={loading} onClick={() => open("login")} className="rounded-full bg-black px-8 py-3 font-bold text-white hover:opacity-80 disabled:opacity-40">
          Đăng nhập
        </button>
        <Link href="/tra-cuu-don-hang" className="rounded-full border-2 border-black px-8 py-3 font-bold hover:bg-black hover:text-white">
          Tra cứu đơn hàng
        </Link>
      </div>
    </div>
  );
}
