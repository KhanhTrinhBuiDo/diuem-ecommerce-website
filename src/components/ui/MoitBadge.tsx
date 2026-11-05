import { moitBadgeHref } from "@/config/site";

/**
 * PLACEHOLDER huy hiệu "Đã thông báo Bộ Công Thương".
 * TODO(badge): đặt ảnh gốc vào public/images/da-thong-bao-bct.png và thay SVG bên dưới bằng <Image>.
 */
export function MoitBadge() {
  return (
    <a href={moitBadgeHref} target="_blank" rel="noopener noreferrer" aria-label="Đã thông báo Bộ Công Thương" className="block w-[180px]">
      <svg viewBox="0 0 180 65" role="img" className="block h-[64.84px] w-[180px]">
        <rect x="30" y="10" width="150" height="45" rx="6" fill="#1b8fd6" />
        <circle cx="32" cy="32" r="30" fill="#fff" />
        <circle cx="32" cy="32" r="23" fill="#1b8fd6" />
        <path d="M21 33l8 8 15-17" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="68" y="30" fill="#fff" fontFamily="Unbounded, sans-serif" fontWeight="700" fontSize="14">ĐÃ THÔNG BÁO</text>
        <text x="68" y="46" fill="#fff" fontFamily="Unbounded, sans-serif" fontSize="10">BỘ CÔNG THƯƠNG</text>
      </svg>
    </a>
  );
}
