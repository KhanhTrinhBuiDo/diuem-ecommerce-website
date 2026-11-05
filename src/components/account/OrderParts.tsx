import Link from "next/link";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { formatVND } from "@/lib/format";
import type { OrderItem, OrderStep } from "@/data/account";

/** Dòng sản phẩm trong đơn (Figma: ảnh 120×120, tên 22px, phân loại, giá bên phải, "x 1"). */
export function OrderItemLine({ item, badge }: { item: OrderItem; badge?: string }) {
  return (
    <div className="flex items-center gap-4 sm:gap-[30px]">
      <ImageOrPlaceholder src={item.image} alt={item.name} label="Ảnh" sizes="120px" className="size-[84px] flex-none sm:size-[120px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <Link href={item.href} className="text-[clamp(15px,1.27vw,22px)] leading-tight hover:text-brand">
            {item.name}
          </Link>
          {badge && <span className="flex-none rounded-[5px] bg-black px-2.5 py-1 text-[clamp(12px,1.04vw,18px)] text-white">{badge}</span>}
        </div>
        <div className="flex items-start justify-between gap-3 text-[clamp(13px,1.04vw,18px)]">
          <span className="font-extralight">{item.variant}</span>
          <span className="font-medium">{formatVND(item.price)}</span>
        </div>
        <span className="text-[clamp(13px,1.04vw,18px)] font-extralight">x {item.qty}</span>
      </div>
    </div>
  );
}

const ICONS: Record<OrderStep["key"], string> = {
  confirmed: "M7 4h10v16H7zM10 8h4M10 12h4M10 16h2",
  handed: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 100-.01M17 19a1.5 1.5 0 100-.01",
  received: "M12 4v9m0 0l-3.5-3.5M12 13l3.5-3.5M5 15v4h14v-4",
  returned: "M4 14c3 0 4 1 6 1s3-2 5-2h5M12 4l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3L7.2 7.5 10.5 7z",
};

/** Thanh tiến trình đơn hàng (Figma "Tình trạng đơn giao"): 4 mốc nối nhau bằng đường hồng. */
export function OrderTimeline({ steps }: { steps: OrderStep[] }) {
  return (
    <ol className="relative mx-auto grid max-w-[1329px] grid-cols-4 gap-2 px-0 sm:px-4">
      <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[22px] h-1 bg-line" />
      {steps.map((s) => {
        const done = s.time !== null;
        return (
          <li key={s.key} className="relative flex flex-col items-center gap-1 text-center">
            <span
              className={`grid size-11 place-items-center rounded-full border-4 border-line ${done ? "bg-line text-white" : "bg-white text-line"}`}
              aria-label={done ? "Đã hoàn tất" : "Chưa tới bước này"}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={ICONS[s.key]} />
              </svg>
            </span>
            <span className="mt-1 text-[clamp(11px,1.04vw,16px)] leading-tight">{s.label}</span>
            <span className="text-[clamp(10px,0.75vw,13px)] font-light">{s.time ?? "—"}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Dải thư (xanh–hồng xen kẽ) phân tách khối trạng thái và địa chỉ, theo Figma "line". */
export function MailStripe() {
  return (
    <div aria-hidden="true" className="h-1 w-full bg-[repeating-linear-gradient(90deg,#7da6d6_0_100px,transparent_100px_112px,#e58d9d_112px_212px,transparent_212px_224px)]" />
  );
}
