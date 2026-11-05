"use client";

import { useState } from "react";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";

type Props = { images: (string | null)[]; name: string };

/**
 * Gallery (Figma Item-Window-view): cột ảnh nhỏ 65×98 bên trái, ảnh lớn 650×975,
 * hai nút tròn ← → mờ ở góc dưới phải ảnh lớn.
 */
export function ProductGallery({ images, name }: Props) {
  const [i, setI] = useState(0);
  const n = images.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);

  return (
    <div className="flex gap-2.5 px-6 py-[30px] lg:justify-end lg:pl-[100px] lg:pr-[30px]">
      <ul className="flex w-[65px] flex-none flex-col gap-2.5" aria-label="Ảnh sản phẩm">
        {images.map((src, idx) => (
          <li key={idx}>
            <button
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Xem ảnh ${idx + 1}`}
              aria-current={idx === i}
              className={`block w-full outline-offset-2 transition-opacity ${idx === i ? "opacity-100 outline outline-2 outline-black" : "opacity-70 hover:opacity-100"}`}
            >
              <ImageOrPlaceholder src={src} alt="" label={`${idx + 1}`} className="aspect-[65/98] w-full" sizes="65px" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative min-w-0 max-w-[650px] flex-1">
        <ImageOrPlaceholder src={images[i]} alt={`${name} – ảnh ${i + 1}`} label={`Ảnh sản phẩm ${i + 1} · 650×975`} className="aspect-[650/975] w-full" sizes="(min-width:1024px) 38vw, 80vw" priority />
        {n > 1 && (
          <div className="absolute bottom-0 right-0 flex gap-5 p-[30px]">
            {(["Ảnh trước", "Ảnh sau"] as const).map((label, k) => (
              <button
                key={label}
                type="button"
                onClick={() => go(k === 0 ? -1 : 1)}
                aria-label={label}
                className="grid size-10 place-items-center rounded-full bg-white/50 text-xl transition-colors hover:bg-white"
              >
                {k === 0 ? "←" : "→"}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
