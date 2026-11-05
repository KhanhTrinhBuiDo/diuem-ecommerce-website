import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "@/components/ui/ArrowRight";

type Props = { href: string; children?: ReactNode; className?: string };

/**
 * Nút "Xem chi tiết →" (Figma Frame 310): 371×61, viền trắng 2px, bo tròn, chữ trắng có glow hồng.
 * Dùng trên nền ảnh tối (banner danh mục, câu chuyện thương hiệu).
 */
export function ExploreButton({ href, children = "Xem chi tiết", className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex h-[61px] w-[371px] max-w-full items-center justify-center gap-[17px] rounded-full border-2 border-white p-[15px] text-[clamp(18px,1.27vw,22px)] font-medium text-white [text-shadow:0_4px_30px_#ff66c4] transition-colors hover:bg-white hover:text-black hover:[text-shadow:none] ${className}`}
    >
      {children}
      <ArrowRight />
    </Link>
  );
}
