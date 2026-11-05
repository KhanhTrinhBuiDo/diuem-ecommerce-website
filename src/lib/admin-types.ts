/** Kiểu dữ liệu & hằng số dùng chung giữa server và client của khu quản trị (khớp schema Supabase v0.3/v0.4). */

export type ProductStatus = "draft" | "active" | "discontinued";
export const productStatusText: Record<ProductStatus, string> = { draft: "Nháp", active: "Đang bán", discontinued: "Ngừng bán" };
export type SizeUnit = "ml" | "g" | "pcs" | "set";
export const sizeUnits: SizeUnit[] = ["ml", "g", "pcs", "set"];

export type VariantRow = { id?: string; sku: string; size_value: number; size_unit: SizeUnit; price_vnd: number; stock_qty: number; is_active: boolean };
export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  kind: "single" | "bundle";
  status: ProductStatus;
  is_featured: boolean;
  category_id: string;
  category_name: string;
  hero_material: string;
  short_description: string;
  usage_instructions: string;
  storage_instructions: string;
  warnings: string;
  shelf_life_months: number | null;
  pao_months: number | null;
  deleted: boolean;
  variants: VariantRow[];
  /** Link Cloudinary; ảnh đầu tiên là ảnh chính */
  images: string[];
};
export type ProductInput = Omit<ProductRow, "id" | "category_name" | "deleted"> & { id?: string };

export type CategoryRow = { id: string; parent_id: string | null; slug: string; name: string; sort_order: number; min_price_vnd: number | null };

export type OrderStatus = "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
export const orderStatusText: Record<OrderStatus, string> = { pending: "Chờ xác nhận", confirmed: "Đã xác nhận", shipping: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy" };
/** Luồng chuyển trạng thái hợp lệ (server kiểm tra lại). */
export const orderNext: Record<OrderStatus, OrderStatus[]> = { pending: ["confirmed", "cancelled"], confirmed: ["shipping", "cancelled"], shipping: ["completed"], completed: [], cancelled: [] };
export const paymentMethodText: Record<string, string> = { cod: "COD", vnpay: "VNPay", zalopay: "ZaloPay", momo: "MoMo", bank_transfer: "Chuyển khoản" };
export const paymentStatusText: Record<string, string> = { pending: "Chưa thanh toán", paid: "Đã thanh toán", failed: "Thất bại", refunded: "Đã hoàn tiền" };

export type OrderItemRow = { id: string; sku: string; product_name: string; unit_price_vnd: number; quantity: number; line_total_vnd: number };
export type OrderRow = {
  id: string;
  order_number: string;
  placed_at: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  ship_name: string;
  ship_phone: string;
  ship_address: string;
  subtotal_vnd: number;
  shipping_fee_vnd: number;
  discount_vnd: number;
  total_vnd: number;
  coupon_code: string | null;
  is_gift: boolean;
  gift_message: string | null;
  customer_note: string | null;
  carrier: string | null;
  tracking_code: string | null;
  items: OrderItemRow[];
};

export type CouponRow = { id: string; code: string; discount_type: "percent" | "fixed"; discount_value: number; min_order_vnd: number; starts_at: string; ends_at: string; is_active: boolean };

export type ActionResult<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };
