/**
 * DỮ LIỆU TẠM cho khu vực tài khoản & đơn hàng.
 * ĐƠN HÀNG (src/lib/orders.ts), HỒ SƠ và SỔ ĐỊA CHỈ (src/lib/account.ts) đã là dữ liệu thật. Còn mẫu: đánh giá, FAQ.
 */
import { productHref } from "@/data/products";

export type Profile = { name: string; phone: string; email: string; gender: "Nam" | "Nữ" | "Khác" | ""; /** yyyy-mm-dd hoặc "" */ birthday: string };

/** Cột `ward` trong DB = Quận/Huyện (giống orders.ship_ward). */
export type Address = { id: string; name: string; phone: string; province: string; district: string; street: string; line: string; isDefault: boolean };

/** Khớp enum `order_status` trong DB. TODO(returns): chưa có trạng thái "hoàn hàng" (câu hỏi mở #34). */
export type OrderStatus = "pending" | "confirmed" | "shipping" | "completed" | "cancelled";

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Vận chuyển",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export type OrderItem = {
  id: string;
  sku: string;
  name: string;
  variant: string;
  qty: number;
  price: number;
  image: string | null;
  href: string;
  /** đã đánh giá chưa */
  reviewed: boolean;
};

export type OrderStep = { key: "placed" | "confirmed" | "handed" | "received"; label: string; time: string | null };

export type Order = {
  id: string;
  /** Mã đơn hàng hiển thị */
  code: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  voucher: number;
  /** 0 = miễn phí */
  shipping: number;
  total: number;
  address: { name: string; phone: string; line: string };
  carrier: string;
  trackingCode: string;
  steps: OrderStep[];
  /** Hạn đổi trả; null = chưa có chính sách (TODO(content)) */
  returnDeadline: string | null;
  paymentLabel: string;
};

/** Đánh giá của chính người dùng (trang "Đánh giá và phản hồi"). */
export type MyReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  product: string;
  variant: string;
  quality: string;
  content: string;
  images: (string | null)[];
  likes: number;
  /** false = đã sửa 1 lần, không cho "Đánh giá lại" (Figma: nút mờ ở thẻ đầu) */
  canRedo: boolean;
  href: string;
};

export const mockMyReviews: MyReview[] = [0, 1, 2].map((i) => ({
  id: `mr-${i + 1}`,
  author: "Khách hàng",
  rating: 5,
  date: "2022-09-16 11:48",
  product: "Dầu gội Hoa Bưởi Thế hệ Mới",
  variant: "450ml",
  quality: "Sản phẩm tốt",
  content:
    "Đã mua lần thứ 2 và chất lượng vẫn quá ok. Sẽ còn ủng hộ nhiều. Mẫu mã rất đẹp, shop chú thích về cân nặng và kg rất chuẩn, chỉ cần chọn theo là ổn luôn.",
  images: [null, null],
  likes: 12,
  canRedo: i !== 0,
  href: productHref("cham-soc-toc", "dau-goi-hoa-buoi-the-he-moi"),
}));

/** TODO(content): 7 câu hỏi mẫu – Figma lặp lại một câu còn sót tên cũ "Xéo Hội"; nội dung thật chờ khách hàng. */
export const mockFaqs = Array.from({ length: 7 }, (_, i) => ({
  id: `faq-${i + 1}`,
  q: `Câu hỏi thường gặp số ${i + 1}`,
  a: "Nội dung trả lời đang cập nhật.",
}));
