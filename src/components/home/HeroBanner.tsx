"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";

export type HeroSlide = {
  id: string;
  image: string | null;
  alt: string;
  /** Nhãn hiện trên khung placeholder khi chưa có ảnh */
  label?: string;
  /** Link khi bấm vào banner (tùy chọn) */
  href?: string;
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="11" height="18" viewBox="0 0 11 18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === "left" ? <path d="M9.5 1.5 2 9l7.5 7.5" /> : <path d="M1.5 1.5 9 9l-7.5 7.5" />}
    </svg>
  );
}

type Props = {
  slides: HeroSlide[];
  /** Thời gian tự chuyển slide (ms). Đặt 0 để tắt tự chuyển. */
  autoPlayMs?: number;
};

/**
 * Banner chính (Figma 1729×615): nền ảnh, mũi tên Back/Next ở hai bên, line hồng 14px bên dưới.
 * - Nhiều slide: tự chuyển (mặc định 6s) hoặc bấm "<" ">". Tạm dừng khi rê chuột / focus bàn phím,
 *   và không tự chuyển nếu người dùng bật "giảm chuyển động".
 * - Một slide: không hiện mũi tên (đúng Figma trang danh mục).
 */
export function HeroBanner({ slides, autoPlayMs = 6000 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  useEffect(() => {
    if (count < 2 || autoPlayMs <= 0 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), autoPlayMs);
    return () => window.clearInterval(timer);
  }, [count, autoPlayMs, paused, index]); // `index` trong deps: bấm tay sẽ reset đồng hồ

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Banner nổi bật"
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[clamp(260px,35.6vw,615px)] w-full overflow-hidden">
        {slides.map((s, i) => (
          <div
            key={s.id}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <ImageOrPlaceholder src={s.image} alt={s.alt} label={s.label} tone="dark" priority={i === 0} className="size-full" />
            {s.href && <Link href={s.href} aria-label={s.alt} tabIndex={i === index ? 0 : -1} className="absolute inset-0" />}
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Banner trước"
              className="absolute left-[clamp(8px,5vw,86px)] top-1/2 grid size-11 -translate-y-1/2 place-items-center text-white drop-shadow-[0_4px_20px_#000]"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Banner sau"
              className="absolute right-[clamp(8px,6.6vw,114px)] top-1/2 grid size-11 -translate-y-1/2 place-items-center text-white drop-shadow-[0_4px_20px_#000]"
            >
              <Chevron direction="right" />
            </button>
          </>
        )}

        {count > 1 && (
          <p className="sr-only" aria-live="polite">
            Banner {index + 1} / {count}
          </p>
        )}
      </div>

      {/* Line-bottom */}
      <div className="h-[14px] w-full bg-line" />
    </section>
  );
}
