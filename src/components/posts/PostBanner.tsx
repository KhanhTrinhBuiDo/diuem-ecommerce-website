import { LogoMark } from "@/components/ui/LogoMark";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";

/**
 * Banner bài viết (Figma Post 1–3, 1729×615): ảnh nền, khung hồng 14px quanh ảnh, đường viền mảnh bên trong,
 * huy hiệu "Dịu Em × Đồng hành CÙNG EM" ở góc trên trái.
 */
export function PostBanner({ src, alt, label, badge }: { src: string | null; alt: string; label: string; badge: boolean }) {
  return (
    <div className="w-full bg-line p-[10px] lg:p-[14px]">
      <div className="relative h-[clamp(200px,calc(var(--vw)*31),560px)] w-full overflow-hidden">
        <ImageOrPlaceholder src={src} alt={alt} label={label} tone="dark" priority sizes="calc(var(--vw)*100)" className="absolute inset-0" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-[3.5%_2.5%] rounded-[10px] border border-line/70" />
        {badge && (
          <div className="absolute left-[2.5%] top-[4%] flex items-center gap-2 text-white">
            <LogoMark className="w-9" />
            <span aria-hidden="true" className="text-xs">×</span>
            <span className="text-[10px] leading-tight lg:text-xs">
              Đồng hành
              <br />
              <b className="text-sm font-bold lg:text-base">CÙNG EM</b>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
