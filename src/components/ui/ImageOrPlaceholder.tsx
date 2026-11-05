import Image from "next/image";

type Props = {
  /** Đường dẫn ảnh (vd "/images/home/banner-1.jpg"). `null` = chưa có ảnh → hiện khung placeholder. */
  src: string | null;
  alt: string;
  /** Nhãn hiện trên khung placeholder (vd "Banner 1 · 1729×615") */
  label?: string;
  /** "light": nền hồng nhạt (cho khối chữ đen) – "dark": nền hồng đậm (cho khối chữ trắng) */
  tone?: "light" | "dark";
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Ảnh dùng chung toàn site. Khi chưa có ảnh thật (src = null) sẽ hiện khung placeholder
 * để bố cục vẫn đúng như Figma. Wrapper luôn `relative overflow-hidden`; đặt kích thước bằng `className`.
 */
export function ImageOrPlaceholder({ src, alt, label, tone = "light", sizes = "100vw", priority = false, className = "" }: Props) {
  // Nếu caller đã đặt absolute/fixed thì không thêm `relative` (tránh hai lớp position tranh nhau).
  const pos = /(^|\s)(absolute|fixed)(\s|$)/.test(className) ? "" : "relative";
  if (src) {
    return (
      <div className={`${pos} overflow-hidden ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  const bg = tone === "dark" ? "bg-[linear-gradient(135deg,#cc3f78,#4a1230)] text-white/80" : "bg-[linear-gradient(135deg,#ffe3f1,#f7b5d6)] text-brand/80";
  return (
    <div role="img" aria-label={alt} className={`${pos} flex items-center justify-center overflow-hidden px-4 text-center text-sm font-light ${bg} ${className}`}>
      {label ?? "Ảnh placeholder"}
    </div>
  );
}
