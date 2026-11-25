/**
 * Hằng số + kiểu dùng chung cho giỏ hàng / đặt hàng (an toàn import ở cả client và server).
 * GIÁ Ở TRÌNH DUYỆT CHỈ ĐỂ HIỂN THỊ — server (hàm SQL `place_order`) tính lại toàn bộ từ database.
 */

/** Đơn từ mức này được freeship. PHẢI khớp hàm SQL `shipping_fee_vnd` (migration v0.7). */
export const FREESHIP_FROM_VND = 300000;
/** TODO(shipping): phí giao hàng khi dưới ngưỡng freeship CHƯA được khách hàng chốt → giá trị tạm. Khớp SQL `shipping_fee_vnd`. */
export const SHIPPING_FEE_VND = 30000;
export const shippingFee = (subtotal: number) => (subtotal >= FREESHIP_FROM_VND ? 0 : SHIPPING_FEE_VND);

export const CART_STORAGE_KEY = "diuem-cart-v1";

export type CartLine = { sku: string; qty: number; selected: boolean };

/** Dữ liệu hiển thị của một sản phẩm trong giỏ, lấy từ catalog (server). */
export type CartProductInfo = {
  productId: string;
  name: string;
  image: string | null;
  href: string;
  variants: { id: string; label: string; price: number; available: boolean; isDefault?: boolean; images?: string[] }[];
};

export type PlaceOrderInput = {
  items: { sku: string; qty: number }[];
  /** Tổng khách đang thấy; lệch với server → báo `price_changed` thay vì chốt giá khác. */
  expectedTotal: number;
  name: string;
  phone: string;
  email: string;
  province: string;
  /** Quận/Huyện (lưu vào cột ship_ward) */
  district: string;
  address: string;
  note: string;
  /** Mã ưu đãi đã được khách áp dụng (server kiểm tra lại) */
  couponCode?: string;
  /** Người nhận khác (nếu có) */
  receiverName?: string;
  receiverPhone?: string;
};

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; subtotal: number; shippingFee: number; discount: number; total: number }
  | {
      ok: false;
      code: "invalid" | "empty" | "unavailable" | "out_of_stock" | "price_changed" | "coupon_invalid" | "rate_limited" | "unconfigured" | "error";
      message: string;
      /** SKU không còn bán / thiếu hàng (kèm số còn lại) */
      items?: { sku: string; name?: string; available?: number }[];
      total?: number;
    };

export type CouponQuote = { ok: true; code: string; discount: number } | { ok: false; message: string };
