import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";
import { AccountButton } from "@/components/layout/AccountButton";
import { CartButton } from "@/components/layout/CartButton";
import { NavMenu } from "@/components/layout/NavMenu";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchBox } from "@/components/layout/SearchBox";
import { mainNav, siteConfig } from "@/config/site";

/**
 * Header theo Figma (1729px): logo – nav – [tìm kiếm, tài khoản, giỏ hàng], line hồng 14px bên dưới.
 *
 * PLACEHOLDER còn lại:
 * - Tài khoản: menu nhỏ (TODO(auth): theo trạng thái đăng nhập).
 * - Giỏ hàng: huy hiệu số lượng lấy từ CartProvider (localStorage).
 */
export function Header() {
  return (
    <header className="relative w-full bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:justify-center lg:gap-[clamp(40px,8.7vw,150px)] lg:px-0 lg:py-[50px]">
        {/* Logo */}
        <Link href="/" aria-label={`${siteConfig.name} – Trang chủ`} className="flex flex-none flex-col items-center justify-center gap-[5px]">
          <LogoMark className="h-[52px] w-[58px] lg:h-[78px] lg:w-[88px]" />
          <span className="text-center text-sm font-normal leading-5 text-brand lg:text-base">{siteConfig.name}</span>
        </Link>

        {/* Nav (desktop) + mega menu SẢN PHẨM */}
        <NavMenu items={mainNav} />

        {/* Right */}
        <div className="flex flex-none items-center gap-3 lg:gap-5">
          <SearchBox className="hidden lg:flex" />
          <AccountButton />
          <CartButton />
          <MobileMenu items={mainNav} />
        </div>
      </div>

      {/* Line-top */}
      <div className="h-[14px] w-full bg-line" />
    </header>
  );
}
