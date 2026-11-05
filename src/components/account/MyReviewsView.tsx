import Link from "next/link";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { mockMyReviews, type MyReview } from "@/data/account";

function Stars({ n }: { n: number }) {
  return (
    <span role="img" aria-label={`${n} trên 5 sao`} className="flex gap-[5px]">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 1.8l3 6.9 7.5.7-5.7 5 1.7 7.4L12 17.8 5.5 21.8l1.7-7.4-5.7-5 7.5-.7z" fill={i < n ? "#000" : "#d9d9d9"} />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ r }: { r: MyReview }) {
  return (
    <article className="flex border border-black">
      <div className="flex-none px-2.5 py-5 sm:w-[118px] sm:pl-0 sm:text-right">
        <ImageOrPlaceholder src={null} alt="" label="" className="ml-auto size-10 rounded-full sm:size-14" />
      </div>
      <div className="min-w-0 flex-1 py-5 pr-4 sm:pr-[30px]">
        <div className="flex flex-col gap-[5px] px-[5px] text-[12px] font-light">
          <p>{r.author}</p>
          <Stars n={r.rating} />
          <p>
            {r.date} | Sản phẩm: {r.product} | Phân loại hàng: {r.variant}
          </p>
        </div>
        <p className="px-[5px] py-2.5 text-[12px] font-light">
          Chất lượng sản phẩm: <strong className="font-bold">{r.quality}</strong>
        </p>
        <p className="px-[5px] py-2.5 text-[12px] font-light leading-[15px] sm:pr-[100px]">{r.content}</p>
        <div className="flex gap-[15px] px-[5px] py-2.5">
          {r.images.map((src, i) => (
            <ImageOrPlaceholder key={i} src={src} alt="Ảnh đánh giá" label="Ảnh" sizes="100px" className="size-20 sm:size-[100px]" />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pl-[5px]">
          <span className="flex items-center gap-3 px-2.5 text-[12px] font-light">
            <svg width="15" height="14" viewBox="0 0 24 22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M7 10v11H3V10zM7 10l4-8c2 0 3 1.5 3 3v4h6l-2 9a2 2 0 01-2 2H7" /></svg>
            {r.likes}
          </span>
          <div className="flex gap-2.5">
            {/* TODO(reviews): "Đánh giá lại" mở ReviewModal ở chế độ sửa; Figma làm mờ ở thẻ đầu (đã sửa 1 lần). */}
            <button type="button" disabled={!r.canRedo} className="h-[42px] rounded-[5px] border-2 border-black/30 px-5 text-[clamp(13px,1.04vw,18px)] font-light text-black/30 enabled:border-black enabled:text-black disabled:cursor-not-allowed">
              Đánh giá lại
            </button>
            <Link href={r.href} className="grid h-[42px] place-items-center rounded-[5px] border-2 border-black px-5 text-[clamp(13px,1.04vw,18px)] font-light">
              Xem trực tiếp
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Hai trạng thái (Figma): có đánh giá → danh sách thẻ; chưa có / chưa đăng nhập → câu thông báo + banner "Khám phá".
 * TODO(auth): chưa đăng nhập nên chuyển hướng/hiện popup đăng nhập thay vì trang trống.
 */
export function MyReviewsView({ empty }: { empty: boolean }) {
  if (empty) {
    return (
      <div className="flex flex-col gap-[25px]">
        <p className="text-[clamp(14px,1.04vw,18px)]">Bạn chưa có bất kỳ đánh giá nào...</p>
        <div className="relative flex min-h-[280px] flex-col justify-end gap-4 overflow-hidden rounded-[10px] border-y-8 border-line p-6 sm:min-h-[346px] sm:p-[50px]">
          {/* TODO(image): ảnh banner "[TMĐT] - PRODUCT DESIGN" */}
          <ImageOrPlaceholder src={null} alt="" label="Banner quyền lợi thành viên" tone="dark" className="absolute inset-0" />
          <h2 className="relative max-w-[605px] text-[clamp(16px,1.16vw,20px)] font-bold text-white [text-shadow:0_4px_20px_rgba(0,0,0,0.5)]">Nhiều quyền lợi hấp dẫn đang chờ bạn</h2>
          <Link href="/san-pham" className="relative grid h-[39px] w-[235px] place-items-center rounded-[30px] border border-white text-[clamp(15px,1.27vw,22px)] font-medium text-white shadow-[0_4px_4px_#000]">
            Khám phá
          </Link>
        </div>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-6">
      {mockMyReviews.map((r) => (
        <li key={r.id}>
          <ReviewCard r={r} />
        </li>
      ))}
    </ul>
  );
}
