import Image from "next/image";
import { siteConfig } from "@/config/site";

/**
 * PLACEHOLDER logo.
 * TODO(logo): đặt file logo thật vào public/images/logo.png (hoặc .svg),
 * rồi đổi LOGO_SRC bên dưới; component sẽ tự dùng ảnh thật.
 */
const LOGO_SRC: string | null = null; // ví dụ: "/images/logo.png"

type Props = { className?: string };

export function LogoMark({ className = "" }: Props) {
  if (LOGO_SRC) {
    return (
      <Image src={LOGO_SRC} alt={siteConfig.name} width={88} height={78} className={`object-contain ${className}`} priority />
    );
  }
  return (
    <svg viewBox="0 0 88 78" role="img" aria-label={`Logo ${siteConfig.name} (placeholder)`} className={className}>
      <rect x="2" y="2" width="84" height="74" rx="10" fill="#CC3F78" />
      <path
        d="M44 14c-8 8-8 18 0 26 8-8 8-18 0-26Zm0 50c8-8 8-18 0-26-8 8-8 18 0 26ZM14 39c8 8 18 8 26 0-8-8-18-8-26 0Zm34 0c8 8 18 8 26 0-8-8-18-8-26 0Z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
      />
    </svg>
  );
}
