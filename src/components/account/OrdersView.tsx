"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { OrderItemLine } from "@/components/account/OrderParts";
import { mockOrders, orderStatusLabel, type Order, type OrderStatus } from "@/data/account";
import { siteConfig } from "@/config/site";
import { formatVND } from "@/lib/format";

type Tab = "all" | OrderStatus;
const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "shipping", label: "Vận chuyển" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
  { key: "returned", label: "Hoàn hàng" },
];

function OrderCard({ order }: { order: Order }) {
  const cart = useCart();
  const router = useRouter();
  function rebuy() {
    for (const it of order.items) {
      const [productId, variantId] = it.id.split(":");
      cart.add({ productId, name: it.name, image: it.image, href: it.href, variantId, variants: [{ id: variantId, label: it.variant, price: it.price, available: true }] }, it.qty);
    }
    router.push("/gio-hang");
  }
  return (
    <article className="border border-black py-5">
      <header className="flex items-center justify-between gap-3 px-5 pb-2.5 text-[clamp(11px,0.75vw,13px)] sm:px-[30px]">
        <p>
          Mã đơn hàng: <span className="break-all">{order.code}</span>
        </p>
        <span className="rounded-[5px] bg-black px-2.5 py-[5px] text-[13px] font-bold text-white">{orderStatusLabel[order.status]}</span>
      </header>
      <div className="px-5 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] sm:px-[30px]">
        <ul className="flex flex-col gap-2.5 border-b-2 border-rule pb-2.5">
          {order.items.map((it) => (
            <li key={it.id}>
              <OrderItemLine item={it} />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-end gap-[30px] px-5 pb-2.5 pt-5 sm:px-[30px]">
        <span className="text-[clamp(13px,1.04vw,18px)] font-light underline">Thành tiền:</span>
        <span className="text-[clamp(20px,1.9vw,33px)] font-bold">{formatVND(order.total)}</span>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3 px-5 py-2.5 sm:gap-[30px] sm:px-[30px]">
        <button type="button" onClick={rebuy} className="h-[47px] rounded-[5px] bg-black px-8 text-[clamp(14px,1.04vw,18px)] font-bold text-white">
          Mua lại
        </button>
        <a href={siteConfig.contact.hotlineHref} className="grid h-[42px] place-items-center rounded-[5px] border-2 border-black px-6 text-[clamp(13px,1.04vw,18px)] font-light">
          Liên hệ đổi hàng
        </a>
        <Link href={`/tai-khoan/don-hang/${order.id}`} className="grid h-[42px] place-items-center rounded-[5px] border-2 border-black px-8 text-[clamp(13px,1.04vw,18px)] font-light">
          Chi tiết
        </Link>
      </div>
    </article>
  );
}

/** Figma "Lịch sử đơn hàng": 5 tab lọc + danh sách thẻ đơn. TODO(supabase): đọc bảng `orders` theo auth.uid(), phân trang. */
export function OrdersView() {
  const [tab, setTab] = useState<Tab>("all");
  const list = tab === "all" ? mockOrders : mockOrders.filter((o) => o.status === tab);
  return (
    <div>
      <div role="tablist" aria-label="Lọc đơn hàng" className="-mt-4 mb-6 flex flex-wrap justify-between gap-x-6 gap-y-2 px-1 sm:px-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-[3px] py-2 text-[clamp(14px,1.27vw,22px)] ${tab === t.key ? "border-black" : "border-transparent"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="py-12 text-center text-[clamp(14px,1.04vw,18px)] font-light">Chưa có đơn hàng nào ở mục này.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {list.map((o) => (
            <li key={o.id}>
              <OrderCard order={o} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
