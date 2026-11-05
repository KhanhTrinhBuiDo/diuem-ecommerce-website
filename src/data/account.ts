/**
 * DỮ LIỆU TẠM cho khu vực tài khoản & đơn hàng.
 * TODO(supabase): bảng `profiles`, `addresses`, `orders`, `order_items`, `order_events`, `reviews`, `faqs`;
 *   mọi bảng có RLS theo `auth.uid()`. Trang tra cứu đơn của khách vãng lai phải đi qua server
 *   (kiểm tra mã đơn + SĐT/email), KHÔNG mở bảng orders cho anon.
 * TODO(auth): hiện chưa có đăng nhập nên các trang /tai-khoan hiển thị dữ liệu mẫu của một tài khoản giả.
 */
import { productHref } from "@/data/products";

export const mockUser = {
  name: "Lê Phước Thịnh",
  phone: "000000982",
  gender: "Nam",
  email: "thinhlp23416@st.uel.edu",
  birthday: "03/09/2005",
};

export type Address = { id: string; name: string; phone: string; line: string; isDefault: boolean };

export const mockAddresses: Address[] = [
  { id: "a1", name: "Lê Phước Thịnh", phone: "0827345627", line: "Kí túc xá khu B ĐHQG, Phường Đông Hòa, TP.HCM", isDefault: true },
  { id: "a2", name: "Phạm Ngọc Mỹ", phone: "0828884855", line: "Kí túc xá khu B ĐHQG, Phường Đông Hòa, TP.HCM", isDefault: false },
];

export type OrderStatus = "shipping" | "completed" | "cancelled" | "returned";

export const orderStatusLabel: Record<OrderStatus, string> = {
  shipping: "Vận chuyển",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  returned: "Hoàn hàng",
};

export type OrderItem = {
  id: string;
  name: string;
  variant: string;
  qty: number;
  price: number;
  image: string | null;
  href: string;
  /** đã đánh giá chưa */
  reviewed: boolean;
};

export type OrderStep = { key: "confirmed" | "handed" | "received" | "returned"; label: string; time: string | null };

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
  returnDeadline: string;
  /** SĐT/email đặt hàng – dùng cho tra cứu khách vãng lai */
  contact: string[];
};

const shampoo = (reviewed: boolean): OrderItem => ({
  id: "dau-goi-hoa-buoi-the-he-moi:450ml",
  name: "Dầu gội Hoa Bưởi Thế hệ Mới",
  variant: "450ml",
  qty: 1,
  price: 250000,
  image: null,
  href: productHref("cham-soc-toc", "dau-goi-hoa-buoi-the-he-moi"),
  reviewed,
});
const conditioner = (reviewed: boolean): OrderItem => ({
  id: "dau-xa-hoa-buoi-the-he-moi:250ml",
  name: "Dầu xả Hoa Bưởi Thế hệ Mới",
  variant: "250ml",
  qty: 1,
  price: 250000,
  image: null,
  href: productHref("cham-soc-toc", "dau-goi-hoa-buoi-the-he-moi"),
  reviewed,
});

const T = "12:00 11.05.2025";
const fullSteps: OrderStep[] = [
  { key: "confirmed", label: "Xác nhận thông tin", time: T },
  { key: "handed", label: "Đã giao cho ĐVVC", time: T },
  { key: "received", label: "Đã nhận hàng", time: T },
  { key: "returned", label: "Hoàn trả hàng", time: T },
];

const addr = { name: "Lê Phước Thịnh", phone: "0827745632", line: "Kí túc xá khu B ĐHQG, Phường Đông Hòa, TP.HCM" };

export const mockOrders: Order[] = [
  {
    id: "260609JM69BRCU",
    code: "260609JM69BRCU",
    status: "completed",
    items: [shampoo(false), conditioner(true)],
    subtotal: 500000,
    voucher: 0,
    shipping: 0,
    total: 500000,
    address: addr,
    carrier: "Giao hàng tiết kiệm",
    trackingCode: "SPXVN068026217776",
    steps: fullSteps,
    returnDeadline: "26-06-2026",
    contact: ["0827745632", "thinhlp23416@st.uel.edu"],
  },
  {
    id: "260609JM69BRCV",
    code: "260609JM69BRCV",
    status: "completed",
    items: [conditioner(true)],
    subtotal: 250000,
    voucher: 0,
    shipping: 0,
    total: 250000,
    address: addr,
    carrier: "Giao hàng tiết kiệm",
    trackingCode: "SPXVN068026217777",
    steps: fullSteps,
    returnDeadline: "26-06-2026",
    contact: ["0827745632"],
  },
  {
    id: "260612AB12XYZ",
    code: "260612AB12XYZ",
    status: "shipping",
    items: [shampoo(false)],
    subtotal: 250000,
    voucher: 0,
    shipping: 30000,
    total: 280000,
    address: addr,
    carrier: "Giao hàng tiết kiệm",
    trackingCode: "SPXVN068026217778",
    steps: [
      { key: "confirmed", label: "Xác nhận thông tin", time: T },
      { key: "handed", label: "Đã giao cho ĐVVC", time: T },
      { key: "received", label: "Đã nhận hàng", time: null },
      { key: "returned", label: "Hoàn trả hàng", time: null },
    ],
    returnDeadline: "—",
    contact: ["0827745632"],
  },
  {
    id: "260601CC99QWE",
    code: "260601CC99QWE",
    status: "cancelled",
    items: [conditioner(false)],
    subtotal: 250000,
    voucher: 0,
    shipping: 0,
    total: 250000,
    address: addr,
    carrier: "—",
    trackingCode: "—",
    steps: [
      { key: "confirmed", label: "Xác nhận thông tin", time: T },
      { key: "handed", label: "Đã giao cho ĐVVC", time: null },
      { key: "received", label: "Đã nhận hàng", time: null },
      { key: "returned", label: "Hoàn trả hàng", time: null },
    ],
    returnDeadline: "—",
    contact: ["0827745632"],
  },
];

export function getOrder(id: string): Order | undefined {
  return mockOrders.find((o) => o.id === id);
}

/** Tra cứu khách vãng lai. TODO(supabase): làm ở server action, giới hạn tốc độ (chống dò mã đơn). */
export function lookupOrder(code: string, contact: string): Order | undefined {
  const c = contact.trim().toLowerCase();
  return mockOrders.find((o) => o.code.toLowerCase() === code.trim().toLowerCase() && o.contact.some((x) => x.toLowerCase() === c));
}

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
  author: mockUser.name,
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
