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
  const statusText = {
    pending: "Đơn hàng đang chờ xác nhận",
    confirmed: "Đơn hàng đã được xác nhận",
    shipping: "Đơn hàng đang vận chuyển",
    completed: "Đơn hàng đã hoàn thành",
    cancelled: "Đơn hàng đã hủy",
  }[order.status];

  function rebuy() {
    for (const it of order.items) {
      cart.add({ productId: it.id.split(":")[0], name: it.name, image: it.image, href: it.href, variantId: it.sku, variants: [{ id: it.sku, label: it.variant, price: it.price, available: true }] }, it.qty);
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
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-3 px-5 pt-8 text-[clamp(14px,calc(var(--vw)*1.27),22px)] font-light sm:px-[50px]">
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
          <p className="text-[clamp(11px,calc(var(--vw)*0.75),13px)] font-light">
            {completed
              ? order.returnDeadline
                ? `Nếu hàng nhận được có vấn đề, bạn có thể yêu cầu Trả hàng/Hoàn tiền trước ${order.returnDeadline}`
                : "Nếu hàng nhận được có vấn đề, vui lòng liên hệ Dịu Em để được hỗ trợ đổi trả." /* TODO(content): hạn đổi trả chờ khách hàng chốt chính sách */
              : order.status === "cancelled" ? "Đơn hàng đã được hủy." : "Đơn hàng đang được xử lý. Bạn có thể theo dõi tình trạng ngay tại đây."}
          </p>
          <div className="flex w-full flex-col gap-[13px] md:w-[267px] md:flex-none">
            {/* TODO(reviews-policy): hạn được đánh giá sau khi nhận hàng (câu hỏi mở 18) – hiện không giới hạn. Cần đăng nhập đúng tài khoản đặt đơn. */}
            <button
              type="button"
              disabled={!completed || !order.items.some((i) => i.itemId)}
              title={completed && !order.items.some((i) => i.itemId) ? "Đăng nhập để đánh giá" : undefined}
              onClick={() => setReviewOpen(true)}
              className="h-[42px] rounded-[5px] border-2 border-black bg-line text-[clamp(14px,calc(var(--vw)*1.04),18px)] font-bold text-white [text-shadow:0_4px_10px_rgba(0,0,0,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Đánh giá
            </button>
            <a href={siteConfig.contact.hotlineHref} className="grid h-[42px] place-items-center rounded-[5px] border-2 border-black text-[clamp(14px,calc(var(--vw)*1.04),18px)]">
              Liên hệ Đổi trả
            </a>
            <button type="button" onClick={rebuy} className="h-[42px] rounded-[5px] border-2 border-black text-[clamp(14px,calc(var(--vw)*1.04),18px)]">
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
            <h2 className="mb-2 text-[clamp(20px,calc(var(--vw)*1.85),32px)]">Địa Chỉ Nhận Hàng</h2>
            <p className="text-[clamp(17px,calc(var(--vw)*1.62),28px)]">{order.address.name}</p>
            <p className="text-[clamp(13px,calc(var(--vw)*1.04),18px)] font-light">{order.address.phone}</p>
            <p className="text-[clamp(13px,calc(var(--vw)*1.04),18px)] font-light">{order.address.line}</p>
          </div>
          <div className="text-[clamp(12px,calc(var(--vw)*1.04),18px)] font-light text-black/50 md:text-right">
            <p>{order.paymentLabel}</p>
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
        <dl className="ml-auto mt-10 grid max-w-[560px] grid-cols-[1fr_auto] text-[clamp(13px,calc(var(--vw)*1.04),18px)]">
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
            <dd className="text-right text-[clamp(20px,calc(var(--vw)*1.85),32px)] font-bold">{formatVND(order.total)}</dd>
          </div>
        </dl>
      </div>
      <div aria-hidden="true" className="mt-10 h-[10px] w-full bg-line" />
      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} items={order.items} onDone={() => { setNote("Cảm ơn bạn đã đánh giá sản phẩm!"); router.refresh(); }} />
      <span className="sr-only">{orderStatusLabel[order.status]}</span>
    </div>
  );
}
