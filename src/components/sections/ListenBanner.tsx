import type { ElementType } from "react";

type Props = {
  /** Phần in đậm đầu tiêu đề (mặc định: tên thương hiệu) */
  brand?: string;
  /** Phần còn lại của tiêu đề, chữ thường */
  title?: string;
  /** Đoạn mô tả chữ viết tay (Momo Signature) */
  text?: string;
  /** Thẻ heading: dùng "h1" nếu đây là tiêu đề chính của trang */
  as?: Extract<ElementType, "h1" | "h2" | "h3">;
  className?: string;
};

/**
 * Khối "Lắng nghe" – dùng lặp lại nhiều nơi trong dự án.
 * Figma: 1728×284, padding 50/100, gap 20; hai thanh hồng 438×5; tiêu đề Unbounded 50px;
 * mô tả Momo Signature 22px.
 * Mọi nội dung đều có thể ghi đè qua props khi tái sử dụng.
 */
export function ListenBanner({
  brand = "Dịu Em",
  title = "luôn lắng nghe bạn",
  text = "Chúng mình luôn trân trọng và mong đợi nhận được mọi ý kiến đóng góp từ khách hàng để có thể nâng cấp trải nghiệm dịch vụ và sản phẩm tốt hơn nữa.",
  as: Heading = "h2",
  className = "",
}: Props) {
  return (
    <section className={`w-full ${className}`}>
      <div className="mx-auto flex w-full max-w-[1728px] flex-col items-start justify-center gap-5 px-6 py-10 lg:px-[100px] lg:py-[50px]">
        <span aria-hidden="true" className="block h-[5px] w-[438px] max-w-full flex-none bg-line" />

        <div className="flex max-w-[1533px] flex-col justify-center gap-2.5">
          <Heading className="text-[clamp(26px,2.9vw,50px)] leading-[1.24] text-black">
            <strong className="font-bold">{brand}</strong> <span className="font-normal">{title}</span>
          </Heading>
          <p className="font-script text-[clamp(16px,1.27vw,22px)] leading-[1.41] text-black">{text}</p>
        </div>

        <span aria-hidden="true" className="block h-[5px] w-[438px] max-w-full flex-none bg-line" />
      </div>
    </section>
  );
}
