import Link from "next/link";
import { LoginRequired } from "@/components/account/LoginRequired";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { ratingLabel } from "@/data/reviews";
import type { MyReview } from "@/lib/reviews";

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
      <div className="min-w-0 flex-1 px-4 py-5 sm:px-[30px]">
        <div className="flex flex-col gap-[5px] px-[5px] text-[12px] font-light">
          <Stars n={r.rating} />
          <p>
            {r.date} | Sản phẩm: {r.productName}{r.variant ? ` | Phân loại hàng: ${r.variant}` : ""}
          </p>
        </div>
        <p className="px-[5px] py-2.5 text-[12px] font-light">
          Chất lượng sản phẩm: <strong className="font-bold">{ratingLabel(r.rating)}</strong>
        </p>
        {r.content && <p className="whitespace-pre-line break-words px-[5px] py-2.5 text-[12px] font-light leading-[15px]">{r.content}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 pl-[5px] pt-2.5">
          <span className="text-[12px] font-light text-black/50">{r.canRedo ? "Bạn có thể sửa đánh giá này 1 lần" : "Đã sửa 1 lần"}</span>
          <div className="flex gap-2.5">
            {/* Sửa đánh giá: mở từ chi tiết đơn hàng (nút "Đánh giá") */}
            {r.canRedo && (
              <Link href="/tai-khoan/lich-su-mua-hang" className="grid h-[42px] place-items-center rounded-[5px] border-2 border-black px-5 text-[clamp(13px,1.04vw,18px)] font-light">
                Đánh giá lại
              </Link>
            )}
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
 */
export function MyReviewsView({ reviews, signedIn }: { reviews: MyReview[]; signedIn: boolean }) {
  if (!signedIn) return <LoginRequired what="đánh giá của bạn" />;
  if (reviews.length === 0) {
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
      {reviews.map((r) => (
        <li key={r.id}>
          <ReviewCard r={r} />
        </li>
      ))}
    </ul>
  );
}
