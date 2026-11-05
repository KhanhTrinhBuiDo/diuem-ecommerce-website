import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumb, type Crumb } from "@/components/catalog/Breadcrumb";
import { ListenBanner } from "@/components/sections/ListenBanner";

export const accountNav = [
  { key: "ho-so", label: "Hồ sơ thông tin", href: "/tai-khoan/ho-so" },
  { key: "lich-su", label: "Lịch sử mua hàng", href: "/tai-khoan/lich-su-mua-hang" },
  { key: "dia-chi", label: "Sổ địa chỉ", href: "/tai-khoan/so-dia-chi" },
  { key: "danh-gia", label: "Đánh giá và phản hồi", href: "/tai-khoan/danh-gia" },
  // TODO(figma): 4 trang đầu ghi "Chính sách chúng tôi", trang FAQ ghi "Câu hỏi thường gặp" → đang dùng tên của trang FAQ.
  { key: "faq", label: "Câu hỏi thường gặp", href: "/tai-khoan/cau-hoi-thuong-gap" },
] as const;

export type AccountKey = (typeof accountNav)[number]["key"];

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="40" height="14" viewBox="0 0 40 14" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className={className}>
      <path d="M0 7h38M32 1l6 6-6 6" />
    </svg>
  );
}

/** Khung chung các trang tài khoản (Figma "Tài khoản của bạn"): breadcrumb + menu trái 372px + thẻ nội dung bóng đổ. */
export function AccountShell({
  active,
  crumb,
  title,
  subtitle,
  rule = "black",
  children,
  withListen = true,
}: {
  active: AccountKey;
  /** Mục cuối breadcrumb */
  crumb: string;
  title: string;
  subtitle?: string;
  rule?: "black" | "pink";
  children: ReactNode;
  withListen?: boolean;
}) {
  const crumbs: Crumb[] = [{ label: "Tài khoản của bạn" }, { label: crumb }];
  return (
    <>
      <Breadcrumb items={crumbs} />
      <div className="mx-auto grid w-full max-w-[1728px] grid-cols-[minmax(0,1fr)] gap-6 px-6 pb-20 lg:grid-cols-[372px_minmax(0,1fr)] lg:gap-[30px] lg:px-[50px] lg:pb-[100px]">
        <nav aria-label="Tài khoản" className="flex flex-col gap-5">
          {accountNav.map((n) => {
            const on = n.key === active;
            return (
              <Link
                key={n.key}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={`flex h-[65px] items-center justify-between gap-4 rounded-[10px] border-2 border-black px-5 text-[clamp(16px,1.16vw,20px)] transition-colors ${
                  on ? "bg-black font-bold text-white" : "bg-white font-normal text-black hover:bg-black/5"
                }`}
              >
                <span>{n.label}</span>
                <Arrow className="flex-none" />
              </Link>
            );
          })}
        </nav>

        <section className="min-w-0 rounded-[20px] bg-white px-5 pb-16 pt-10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] lg:px-[50px] lg:pb-[100px] lg:pt-[50px]">
          <header>
            <h1 className="-rotate-[0.26deg] text-[clamp(26px,2.55vw,44px)] font-bold leading-tight">{title}</h1>
            {subtitle && <p className="mt-1 -rotate-[0.26deg] text-[clamp(14px,1.04vw,18px)] leading-snug">{subtitle}</p>}
            <div aria-hidden="true" className={`mt-5 h-[5px] w-full ${rule === "pink" ? "bg-line" : "bg-black"}`} />
          </header>
          <div className="mt-[35px]">{children}</div>
        </section>
      </div>
      {withListen && <ListenBanner />}
    </>
  );
}
