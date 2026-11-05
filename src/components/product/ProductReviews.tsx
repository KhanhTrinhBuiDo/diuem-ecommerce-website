"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "@/components/ui/ArrowRight";
import { FlagIcon, ThumbIcon } from "@/components/ui/icons2";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { RatingStars } from "@/components/ui/RatingStars";
import type { Review } from "@/data/reviews";

type Filter = "all" | "text" | "media" | 1 | 2 | 3 | 4 | 5;
const PAGE = 3;

/** Định dạng bằng cắt chuỗi (không dùng múi giờ) để server và trình duyệt luôn ra cùng kết quả. */
const fmtDate = (iso: string) => `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;

/** "ĐÁNH GIÁ SẢN PHẨM" (Figma): điểm trung bình, bộ lọc chip, danh sách thẻ xám, nút XEM THÊM. */
export function ProductReviews({ reviews, average }: { reviews: Review[]; average: number }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [visible, setVisible] = useState(PAGE);

  const counts = useMemo(() => {
    const byStar = (s: number) => reviews.filter((r) => r.rating === s).length;
    return { star: [5, 4, 3, 2, 1].map((s) => [s, byStar(s)] as const), text: reviews.filter((r) => r.content).length, media: reviews.filter((r) => r.images.length).length };
  }, [reviews]);

  const list = reviews.filter((r) => (filter === "all" ? true : filter === "text" ? !!r.content : filter === "media" ? r.images.length > 0 : r.rating === filter));
  const shown = list.slice(0, visible);

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: "Tất cả bình luận" },
    ...counts.star.map(([s, n]) => ({ id: s as Filter, label: `${s} Sao (${n})` })),
    { id: "text", label: `Có Bình luận (${counts.text})` },
    { id: "media", label: `Có Hình ảnh / Video (${counts.media})` },
  ];

  return (
    <section aria-labelledby="danh-gia" className="mx-auto w-full max-w-[1728px] px-6 py-[50px] lg:px-[100px]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <div className="flex-none">
          <h2 id="danh-gia" className="text-[clamp(20px,1.85vw,32px)] font-bold">ĐÁNH GIÁ SẢN PHẨM</h2>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[clamp(32px,3.2vw,56px)] font-bold leading-none">{average.toFixed(1)}</span>
            <span className="text-lg font-bold">trên 5</span>
            <RatingStars value={average} size={24} />
          </div>
        </div>
        <div role="group" aria-label="Lọc đánh giá" className="flex flex-wrap gap-x-3 gap-y-3">
          {chips.map((c) => (
            <button
              key={String(c.id)}
              type="button"
              aria-pressed={filter === c.id}
              onClick={() => {
                setFilter(c.id);
                setVisible(PAGE);
              }}
              className={`rounded-[10px] border px-4 py-2 text-sm font-light transition-colors ${filter === c.id ? "border-black bg-black text-white" : "border-black/50 hover:border-black"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mx-auto mt-8 flex max-w-[1528px] flex-col gap-5">
        {shown.map((r) => (
          <li key={r.id} className="rounded-[10px] bg-[#ededed] px-5 py-6 lg:px-[75px]">
            <article className="flex flex-col gap-2 text-sm">
              <header className="flex items-start gap-3">
                <ImageOrPlaceholder src={r.avatar} alt="" label="" className="size-[34px] flex-none rounded-full" sizes="34px" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">{r.author}</span>
                  <RatingStars value={r.rating} size={13} />
                  <span className="text-xs font-extralight">
                    {fmtDate(r.date)} | Phân loại hàng: {r.variant}
                  </span>
                </div>
              </header>
              <p className="text-xs">
                Chất lượng sản phẩm: <strong>{r.quality}</strong>
              </p>
              <p className="text-xs font-extralight">{r.content}</p>
              {r.images.length > 0 && (
                <ul className="flex gap-2.5 pt-1">
                  {r.images.map((src, i) => (
                    <li key={i}>
                      <ImageOrPlaceholder src={src} alt={`Ảnh đánh giá ${i + 1}`} label="" className="size-[72px]" sizes="72px" />
                    </li>
                  ))}
                </ul>
              )}
              <footer className="flex items-center justify-between pt-1 text-xs">
                {/* TODO(reviews): like/báo cáo cần đăng nhập + lưu vào Supabase */}
                <span className="inline-flex items-center gap-1.5" aria-label={`${r.likes} lượt thích`}>
                  <ThumbIcon className="size-4" /> {r.likes}
                </span>
                <FlagIcon className="size-4" aria-label="Báo cáo" role="img" />
              </footer>
            </article>
          </li>
        ))}
        {shown.length === 0 && <li className="py-10 text-center font-extralight">Chưa có đánh giá phù hợp bộ lọc này.</li>}
      </ul>

      <div className="mt-8 flex flex-col items-center gap-3">
        {shown.length < list.length && (
          <button type="button" onClick={() => setVisible((v) => v + PAGE)} className="inline-flex h-[47px] w-[294px] max-w-full items-center justify-center gap-2.5 rounded-full bg-black text-[clamp(16px,1.27vw,22px)] font-medium text-white transition-opacity hover:opacity-80">
            XEM THÊM
            <ArrowRight width={30} />
          </button>
        )}
        <p aria-live="polite" className="text-center text-[clamp(14px,1.04vw,18px)] font-extralight">
          Hiển thị {shown.length} trên tổng số {list.length} bình luận
        </p>
      </div>
    </section>
  );
}
