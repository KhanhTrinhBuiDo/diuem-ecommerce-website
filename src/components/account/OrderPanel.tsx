"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { OrderItemLine, OrderTimeline, MailStripe } from "@/components/account/OrderParts";
import { ReviewModal } from "@/components/account/ReviewModal";
import { orderStatusLabel, type Order } from "@/data/account";
import { siteConfig } from "@/config/site";
import { formatVND } from "@/lib/format";

/** Thẻ chi tiết đơn dùng chung cho /tai-khoan/don-hang/[id] và kết quả /tra-cuu-don-hang. */
export function OrderPanel({ order, back }: { order: Order; back: { label: string; href?: string; onClick?: () => void } }) {
  const cart = useCart();
  const router = useRouter();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [note, setNote] = useState("");
  const completed = order.status === "completed";
  const statusText =
    order.status === "completed" ? "Đơn hàng đã hoàn thành" : order.status === "shipping" ? "Đơn hàng đang vận chuyển" : order.status === "cancelled" ? "Đơn hàng đã hủy" : "Đơn hàng đã hoàn trả";

  function rebuy() {
    for (const it of order.items) {
      const [productId, variantId] = it.id.split(":");
      cart.add({ productId, name: it.name, image: it.image, href: it.href, variantId, variants: [{ id: variantId, label: it.variant, price: it.price, available: true }] }, it.qty);
    }
    router.push("/gio-hang");
  }

  const backContent = (
    <>
      <svg width="15" height="27" viewBox="0 0 15 27" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M13 2L2 13.5 13 25" />
      </svg>
      <span className="underline">{back.label}</span>
    </>
  );

  return (
    <div className="overflow-hidden bg-white shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-3 px-5 pt-8 text-[clamp(14px,1.27vw,22px)] font-light sm:px-[50px]">
        {back.href ? (
          <Link href={back.href} className="flex items-center gap-5">
            {backContent}
          </Link>
        ) : (
          <button type="button" onClick={back.onClick} className="flex items-center gap-5">
            {backContent}
          </button>
        )}
        <p className="flex flex-wrap items-center gap-x-5">
          <span>
            Mã đơn hàng: <span className="ml-2 break-all">{order.code}</span>
          </span>
          <span aria-hidden="true">|</span>
          <span className="text-line">{statusText}</span>
        </p>
      </div>

      <div className="px-3 pb-10 pt-10 sm:px-[50px]">
        <OrderTimeline steps={order.steps} />
      </div>

      <section className="bg-[#fffdf7]">
        <div className="flex flex-col gap-6 px-5 pb-12 pt-8 sm:px-[50px] md:flex-row md:justify-between">
          <p className="text-[clamp(11px,0.75vw,13px)] font-light">
            {completed ? `Nếu hàng nhận được có vấn đề, bạn có thể yêu cầu Trả hàng/Hoàn tiền trước ${order.returnDeadline}` : "Đơn hàng đang được xử lý. Bạn có thể theo dõi tình trạng ngay tại đây."}
          </p>
          <div className="flex w-full flex-col gap-[13px] md:w-[267px] md:flex-none">
            {/* TODO(reviews): chỉ cho đánh giá khi đơn đã hoàn thành & chưa quá hạn đánh giá (chốt chính sách ở câu hỏi mở 18). */}
            <button
              type="button"
              disabled={!completed}
              onClick={() => setReviewOpen(true)}
              className="h-[42px] rounded-[5px] border-2 border-black bg-line text-[clamp(14px,1.04vw,18px)] font-bold text-white [text-shadow:0_4px_10px_rgba(0,0,0,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Đánh giá
            </button>
            <a href={siteConfig.contact.hotlineHref} className="grid h-[42px] place-items-center rounded-[5px] border-2 border-black text-[clamp(14px,1.04vw,18px)]">
              Liên hệ Đổi trả
            </a>
            <button type="button" onClick={rebuy} className="h-[42px] rounded-[5px] border-2 border-black text-[clamp(14px,1.04vw,18px)]">
              Mua lại
            </button>
          </div>
        </div>
        {note && (
          <p role="status" className="px-5 pb-4 text-sm text-brand sm:px-[50px]">
            {note}
          </p>
        )}
        <MailStripe />
        <div className="flex flex-col justify-between gap-6 px-5 py-8 sm:px-[50px] md:flex-row">
          <div className="flex flex-col gap-[15px]">
            <h2 className="mb-2 text-[clamp(20px,1.85vw,32px)]">Địa Chỉ Nhận Hàng</h2>
            <p className="text-[clamp(17px,1.62vw,28px)]">{order.address.name}</p>
            <p className="text-[clamp(13px,1.04vw,18px)] font-light">{order.address.phone}</p>
            <p className="text-[clamp(13px,1.04vw,18px)] font-light">{order.address.line}</p>
          </div>
          <div className="text-[clamp(12px,1.04vw,18px)] font-light text-black/50 md:text-right">
            <p>{order.carrier}</p>
            <p className="break-all">{order.trackingCode}</p>
          </div>
        </div>
      </section>

      <div className="px-5 pt-8 sm:px-[50px]">
        <div className="border-y-2 border-rule py-5">
          <ul className="flex flex-col gap-5">
            {order.items.map((it) => (
              <li key={it.id}>
                <OrderItemLine item={it} />
              </li>
            ))}
          </ul>
        </div>
        <dl className="ml-auto mt-10 grid max-w-[560px] grid-cols-[1fr_auto] text-[clamp(13px,1.04vw,18px)]">
          {[
            ["Tạm tính", formatVND(order.subtotal)],
            ["Voucher ưu đãi", formatVND(order.voucher)],
            ["Phí giao hàng", order.shipping === 0 ? "Miễn phí" : formatVND(order.shipping)],
          ].map(([k, v]) => (
            <div key={k} className="col-span-2 grid grid-cols-subgrid border-b border-rule py-2.5">
              <dt className="font-light">{k}</dt>
              <dd className="text-right font-light">{v}</dd>
            </div>
          ))}
          <div className="col-span-2 grid grid-cols-subgrid items-center py-4">
            <dt className="font-light">Thành tiền</dt>
            <dd className="text-right text-[clamp(20px,1.85vw,32px)] font-bold">{formatVND(order.total)}</dd>
          </div>
        </dl>
      </div>
      <div aria-hidden="true" className="mt-10 h-[10px] w-full bg-line" />
      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} items={order.items} onDone={() => setNote("Cảm ơn bạn! Đánh giá chỉ là bản mô phỏng, chưa lưu vào hệ thống.")} />
      <span className="sr-only">{orderStatusLabel[order.status]}</span>
    </div>
  );
}
