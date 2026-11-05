"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { MiniProductCard } from "@/components/product/MiniProductCard";
import type { Product } from "@/components/home/ProductCard";
import { PhoneOutlineIcon, ShareIcon, TruckIcon, GiftIcon } from "@/components/ui/icons2";
import { CartPlusIcon } from "@/components/ui/icons2";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { RatingStars } from "@/components/ui/RatingStars";
import { Stepper } from "@/components/ui/Stepper";
import { siteConfig } from "@/config/site";
import { formatVND } from "@/lib/format";
import { defaultVariant, type ProductDetail } from "@/data/products";

type Props = { product: ProductDetail; href: string; rating: number; suggestions: Product[] };

/** Cột thông tin bên phải (Figma "Details Information"). */
export function ProductInfo({ product, href, rating, suggestions }: Props) {
  const cart = useCart();
  const [variantId, setVariantId] = useState(defaultVariant(product).id);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId)!;
  const addRef = useRef<HTMLButtonElement>(null);
  const [stuck, setStuck] = useState(false);

  // Follow bar: hiện khi nút "Thêm vào giỏ hàng" đã cuộn khỏi màn hình (phía trên).
  useEffect(() => {
    const el = addRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function addToCart() {
    cart.add({ productId: product.slug, name: product.name, image: product.images[0], href, variants: product.variants, variantId }, qty);
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
    } catch {
      /* người dùng huỷ chia sẻ */
    }
  }

  return (
    <div className="flex flex-col gap-[15px] px-6 py-[30px] lg:px-[50px] lg:pr-[100px]">
      <FollowBar
        visible={stuck}
        product={product}
        rating={rating}
        variantId={variantId}
        onVariant={setVariantId}
        qty={qty}
        onQty={setQty}
        price={variant.price}
        onAdd={addToCart}
      />
      <div className="flex flex-col gap-2.5 border-b border-black pb-5">
        <h1 className="text-[clamp(22px,1.85vw,32px)] font-bold leading-tight">{product.name}</h1>
        <div className="flex flex-wrap items-center gap-x-[50px] gap-y-2">
          <div className="flex items-center gap-2.5">
            <RatingStars value={rating} size={28} />
            <span className="text-lg font-light">({rating.toFixed(1)})</span>
          </div>
          <button type="button" onClick={share} className="inline-flex items-center gap-3.5 text-lg font-light text-[#2e54ff] hover:underline">
            <ShareIcon className="h-[22px] w-5" />
            Chia sẻ
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[18px] pb-2.5">
        <p className="text-[clamp(22px,1.85vw,32px)] font-bold leading-tight">{formatVND(variant.price)}</p>
        {product.freeShip && (
          <p className="flex items-center gap-5 text-lg">
            <TruckIcon className="h-[22px] w-[30px]" />
            Freeship
          </p>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-5">
          <p className="text-lg">
            Kích thước: <strong className="font-bold">{variant.label}</strong>
          </p>
          <div role="radiogroup" aria-label="Kích thước" className="flex flex-wrap gap-[15px]">
            {product.variants.map((v) => {
              const active = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={!v.available}
                  onClick={() => setVariantId(v.id)}
                  className={`h-[33px] min-w-[132px] rounded-full border-2 px-5 text-lg font-bold transition-colors ${
                    !v.available ? "cursor-not-allowed border-[#5a5a5a] bg-rule text-[#5a5a5a]" : active ? "border-black bg-white text-black" : "border-black/40 bg-white text-black/60 hover:border-black"
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-[30px]">
        <Stepper value={qty} onChange={setQty} />
        <button
          ref={addRef}
          type="button"
          onClick={addToCart}
          className="inline-flex h-[70px] min-w-0 flex-1 items-center justify-center gap-[22px] rounded-full bg-black text-[clamp(16px,1.27vw,22px)] font-bold text-white transition-opacity hover:opacity-80 lg:max-w-[546px]"
        >
          <CartPlusIcon className="size-8" />
          Thêm vào giỏ hàng
        </button>
      </div>
      <a href="#mo-ta-san-pham" className="self-center text-lg font-bold underline hover:text-brand">
        Mô tả sản phẩm
      </a>

      <div className="flex flex-col gap-2.5">
        <div className="h-0.5 bg-rule" />
        {/* Figma "Mô tả sản phẩm": 4 dòng cam kết */}
        <ul className="grid gap-x-5 gap-y-5 rounded-[10px] bg-[#ededed] px-6 py-5 sm:grid-cols-2 lg:px-[50px]">
          <Perk icon={<span className="text-[15px] font-bold leading-tight">FREE<br />SHIP</span>}>Freeship cho đơn từ 300k</Perk>
          <Perk icon={<span className="text-[15px] font-bold">↔72</span>}>Hỗ trợ 72H<br />Đổi dung tích sản phẩm</Perk>
          <Perk icon={<PhoneOutlineIcon className="size-9" />}>
            Hotline{" "}
            <a href={siteConfig.contact.hotlineHref} className="underline hover:text-brand">
              {siteConfig.contact.hotline.replaceAll(" ", ".")}
            </a>{" "}
            hỗ trợ 24/7
          </Perk>
          <Perk icon={<GiftIcon className="h-8 w-9" />}>Hỗ trợ<br />Gói quà và viết thiệp</Perk>
        </ul>
        <div className="h-0.5 bg-rule" />
      </div>

      <section aria-labelledby="goi-y" className="flex flex-col gap-[15px] py-2.5">
        <h2 id="goi-y" className="text-[clamp(18px,1.27vw,22px)] font-bold underline">
          CÓ THỂ PHÙ HỢP VỚI BẠN
        </h2>
        <ul className="grid grid-cols-3 gap-[clamp(10px,1.45vw,25px)] lg:max-w-[575px]">
          {suggestions.slice(0, 3).map((p) => (
            <li key={p.id}>
              <MiniProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Perk({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-5">
      <span className="grid h-[50px] w-[75px] flex-none place-items-center rounded-[10px] border-[3px] border-black text-center">{icon}</span>
      <span className="text-xs leading-[1.5]">{children}</span>
    </li>
  );
}

/**
 * Thanh theo dõi cuộn (Figma "Noti - Follow Bar"): dính trên cùng khi người dùng cuộn qua nút thêm giỏ.
 * Chỉ hiện ≥ lg (mobile giữ nguyên bố cục, tránh che nội dung).
 * TODO(supabase): "Đã bán" lấy từ dữ liệu thật.
 */
const SOLD_PLACEHOLDER = 1014;
function FollowBar({
  visible,
  product,
  rating,
  variantId,
  onVariant,
  qty,
  onQty,
  price,
  onAdd,
}: {
  visible: boolean;
  product: ProductDetail;
  rating: number;
  variantId: string;
  onVariant: (id: string) => void;
  qty: number;
  onQty: (n: number) => void;
  price: number;
  onAdd: () => void;
}) {
  const current = product.variants.find((v) => v.id === variantId)!;
  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 top-0 z-40 hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 lg:block ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="mx-auto flex max-w-[1728px] items-center justify-between gap-6 px-[clamp(24px,5.8vw,100px)] py-[clamp(12px,1.7vw,30px)]">
        <div className="flex min-w-0 items-center gap-[clamp(20px,3vw,50px)]">
          <div className="flex items-center gap-5">
            <ImageOrPlaceholder src={product.images[0]} alt="" label="Ảnh" sizes="117px" className="h-[clamp(90px,8.7vw,150px)] w-[clamp(70px,6.8vw,117px)] flex-none" />
            <div className="flex min-w-0 flex-col justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-[clamp(15px,1.04vw,18px)] font-bold leading-[22px]">{product.name}</p>
                <p className="text-[clamp(15px,1.04vw,18px)] leading-[22px]">{formatVND(price)}</p>
                <RatingStars value={rating} size={16} />
              </div>
              <p className="text-base font-extralight">Đã bán: {SOLD_PLACEHOLDER}</p>
            </div>
          </div>
          <div className="flex flex-col gap-[15px]">
            <p className="flex items-center gap-[30px] text-[clamp(15px,1.04vw,18px)]">
              <span className="font-extralight">Kích thước:</span>
              <strong className="font-bold">{current.label}</strong>
            </p>
            <div role="radiogroup" aria-label="Kích thước" className="flex gap-[15px]">
              {product.variants.map((v) => {
                const active = v.id === variantId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={!v.available}
                    onClick={() => onVariant(v.id)}
                    className={`h-[33px] min-w-[100px] rounded-full border-2 px-4 text-[clamp(14px,1.04vw,18px)] font-bold ${
                      !v.available ? "cursor-not-allowed border-[#5a5a5a] bg-rule text-[#5a5a5a]" : active ? "border-black bg-white" : "border-black/40 bg-white text-black/60 hover:border-black"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <span aria-hidden="true" className="hidden h-[135px] w-px flex-none bg-black/50 xl:block" />
        <div className="flex flex-none items-center gap-[30px]">
          <Stepper value={qty} onChange={onQty} label="Số lượng (thanh theo dõi)" />
          <button type="button" onClick={onAdd} className="h-16 w-[clamp(200px,18vw,312px)] rounded-full bg-black text-[clamp(16px,1.27vw,22px)] font-bold text-white transition-opacity hover:opacity-80">
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
