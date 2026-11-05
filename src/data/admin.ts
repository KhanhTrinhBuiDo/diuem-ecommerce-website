/**
 * DỮ LIỆU TẠM cho khu vực quản trị (/admin).
 * TODO(supabase): bảng `products`, `product_variants`, `categories`, `orders`, `order_items`, `profiles`,
 *   `reviews`, `vouchers`, `banners`, `site_settings`, `staff` (role). Mọi thao tác ghi phải đi qua server
 *   (route handler / server action) kiểm tra role = admin bằng RLS + policy, KHÔNG tin dữ liệu từ trình duyệt.
 * Số liệu cố định (không random) để tránh lệch hydration.
 */

export type AdminProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "hidden";
  sold: number;
};

export const categoryOptions = ["Chăm sóc mặt", "Chăm sóc tóc", "Chăm sóc cơ thể", "Combo", "Quà tặng"];

export const adminProducts: AdminProduct[] = [
  { id: "p1", name: "Dầu gội Hoa Bưởi Thế hệ Mới", sku: "DG-HB-450", category: "Chăm sóc tóc", price: 250000, stock: 124, status: "active", sold: 1014 },
  { id: "p2", name: "Dầu xả Hoa Bưởi Thế hệ Mới", sku: "DX-HB-250", category: "Chăm sóc tóc", price: 250000, stock: 8, status: "active", sold: 640 },
  { id: "p3", name: "Sữa rửa mặt Dịu Nhẹ", sku: "RM-DN-150", category: "Chăm sóc mặt", price: 180000, stock: 56, status: "active", sold: 452 },
  { id: "p4", name: "Toner Hoa Cúc", sku: "TN-HC-200", category: "Chăm sóc mặt", price: 220000, stock: 0, status: "active", sold: 388 },
  { id: "p5", name: "Kem dưỡng ẩm Ban Đêm", sku: "KD-BD-50", category: "Chăm sóc mặt", price: 390000, stock: 31, status: "active", sold: 275 },
  { id: "p6", name: "Sữa dưỡng thể Hương Sen", sku: "DT-HS-300", category: "Chăm sóc cơ thể", price: 280000, stock: 77, status: "active", sold: 301 },
  { id: "p7", name: "Sữa tắm Hoa Bưởi", sku: "ST-HB-450", category: "Chăm sóc cơ thể", price: 210000, stock: 12, status: "active", sold: 512 },
  { id: "p8", name: "Combo Chăm sóc tóc Hoa Bưởi", sku: "CB-CT-01", category: "Combo", price: 450000, stock: 40, status: "active", sold: 233 },
  { id: "p9", name: "Bộ quà tặng Người Thương", sku: "QT-NT-01", category: "Quà tặng", price: 690000, stock: 19, status: "active", sold: 96 },
  { id: "p10", name: "Son dưỡng Hồng Đào", sku: "SD-HD-04", category: "Chăm sóc mặt", price: 150000, stock: 210, status: "draft", sold: 0 },
  { id: "p11", name: "Tinh dầu Bưởi (bản cũ)", sku: "TD-B-10", category: "Chăm sóc cơ thể", price: 320000, stock: 3, status: "hidden", sold: 87 },
];

export type AdminCategory = { id: string; name: string; slug: string; description: string; visible: boolean };
export const adminCategories: AdminCategory[] = [
  { id: "c1", name: "Chăm sóc mặt", slug: "cham-soc-mat", description: "Rửa mặt, toner, kem dưỡng, son dưỡng", visible: true },
  { id: "c2", name: "Chăm sóc tóc", slug: "cham-soc-toc", description: "Dầu gội, dầu xả, dưỡng tóc", visible: true },
  { id: "c3", name: "Chăm sóc cơ thể", slug: "cham-soc-co-the", description: "Dưỡng thể, làm sạch cơ thể", visible: true },
  { id: "c4", name: "Combo", slug: "combo", description: "Combo tiết kiệm theo nhu cầu", visible: true },
  { id: "c5", name: "Quà tặng", slug: "qua-tang", description: "Bộ quà tặng người thương", visible: true },
  { id: "c6", name: "Ngành khác", slug: "nganh-khac", description: "Chăm sóc bé, tinh dầu, nước hoa", visible: false },
];

export type AdminOrderStatus = "pending" | "confirmed" | "shipping" | "completed" | "cancelled" | "returned";
export const orderStatusText: Record<AdminOrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  returned: "Hoàn hàng",
};
export type AdminOrder = {
  id: string;
  code: string;
  customer: string;
  phone: string;
  address: string;
  date: string; // YYYY-MM-DD
  items: { name: string; qty: number; price: number }[];
  shipping: number;
  voucher: number;
  status: AdminOrderStatus;
  payment: "COD" | "Chuyển khoản";
};
export const orderTotal = (o: AdminOrder) => o.items.reduce((s, i) => s + i.qty * i.price, 0) + o.shipping - o.voucher;

export const adminOrders: AdminOrder[] = [
  { id: "o1", code: "260611AB01XYZ", customer: "Lê Phước Thịnh", phone: "0827745632", address: "Ký túc xá khu B ĐHQG, Phường Đông Hòa, TP.HCM", date: "2026-11-04", items: [{ name: "Dầu gội Hoa Bưởi Thế hệ Mới", qty: 2, price: 250000 }], shipping: 0, voucher: 0, status: "pending", payment: "COD" },
  { id: "o2", code: "260611AB02QWE", customer: "Nguyễn Thị Mai", phone: "0903123456", address: "12 Lê Lợi, Quận 1, TP.HCM", date: "2026-11-04", items: [{ name: "Combo Chăm sóc tóc Hoa Bưởi", qty: 1, price: 450000 }, { name: "Toner Hoa Cúc", qty: 1, price: 220000 }], shipping: 0, voucher: 50000, status: "confirmed", payment: "Chuyển khoản" },
  { id: "o3", code: "260610CD03RTY", customer: "Trần Bảo Ngọc", phone: "0987654321", address: "45 Nguyễn Huệ, TP. Huế", date: "2026-11-03", items: [{ name: "Sữa dưỡng thể Hương Sen", qty: 2, price: 280000 }], shipping: 30000, voucher: 0, status: "shipping", payment: "COD" },
  { id: "o4", code: "260610CD04UIO", customer: "Phạm Quỳnh Anh", phone: "0912345678", address: "8 Trần Phú, Đà Nẵng", date: "2026-11-02", items: [{ name: "Bộ quà tặng Người Thương", qty: 1, price: 690000 }], shipping: 0, voucher: 0, status: "completed", payment: "Chuyển khoản" },
  { id: "o5", code: "260609EF05ASD", customer: "Võ Thanh Hà", phone: "0933222111", address: "99 Hai Bà Trưng, Hà Nội", date: "2026-11-01", items: [{ name: "Sữa rửa mặt Dịu Nhẹ", qty: 3, price: 180000 }], shipping: 0, voucher: 30000, status: "completed", payment: "COD" },
  { id: "o6", code: "260609EF06FGH", customer: "Đặng Minh Châu", phone: "0944111222", address: "3 Pasteur, Cần Thơ", date: "2026-10-31", items: [{ name: "Sữa tắm Hoa Bưởi", qty: 1, price: 210000 }], shipping: 30000, voucher: 0, status: "cancelled", payment: "COD" },
  { id: "o7", code: "260608GH07JKL", customer: "Lê Phước Thịnh", phone: "0827745632", address: "Ký túc xá khu B ĐHQG, Phường Đông Hòa, TP.HCM", date: "2026-10-30", items: [{ name: "Dầu xả Hoa Bưởi Thế hệ Mới", qty: 1, price: 250000 }], shipping: 0, voucher: 0, status: "returned", payment: "COD" },
  { id: "o8", code: "260607IJ08ZXC", customer: "Ngô Khánh Linh", phone: "0966333444", address: "27 Điện Biên Phủ, Bình Thạnh, TP.HCM", date: "2026-10-29", items: [{ name: "Kem dưỡng ẩm Ban Đêm", qty: 1, price: 390000 }, { name: "Dầu gội Hoa Bưởi Thế hệ Mới", qty: 1, price: 250000 }], shipping: 0, voucher: 0, status: "completed", payment: "Chuyển khoản" },
];

export type AdminCustomer = { id: string; name: string; email: string; phone: string; joined: string; orders: number; spent: number; locked: boolean };
export const adminCustomers: AdminCustomer[] = [
  { id: "u1", name: "Lê Phước Thịnh", email: "thinhlp23416@st.uel.edu", phone: "0827745632", joined: "2026-09-12", orders: 2, spent: 500000, locked: false },
  { id: "u2", name: "Nguyễn Thị Mai", email: "mai.nguyen@example.com", phone: "0903123456", joined: "2026-08-20", orders: 5, spent: 2150000, locked: false },
  { id: "u3", name: "Trần Bảo Ngọc", email: "ngoc.tran@example.com", phone: "0987654321", joined: "2026-10-02", orders: 1, spent: 590000, locked: false },
  { id: "u4", name: "Phạm Quỳnh Anh", email: "anh.pham@example.com", phone: "0912345678", joined: "2026-07-15", orders: 8, spent: 4320000, locked: false },
  { id: "u5", name: "Võ Thanh Hà", email: "ha.vo@example.com", phone: "0933222111", joined: "2026-10-18", orders: 1, spent: 510000, locked: false },
  { id: "u6", name: "Đặng Minh Châu", email: "chau.dang@example.com", phone: "0944111222", joined: "2026-10-25", orders: 1, spent: 0, locked: true },
];

export type AdminReview = { id: string; author: string; product: string; rating: number; content: string; date: string; status: "pending" | "approved" | "hidden"; reply: string };
export const adminReviews: AdminReview[] = [
  { id: "r1", author: "Nguyễn Thị Mai", product: "Dầu gội Hoa Bưởi Thế hệ Mới", rating: 5, content: "Mùi hoa bưởi rất dễ chịu, tóc mềm hơn hẳn sau 2 tuần dùng.", date: "2026-11-04", status: "pending", reply: "" },
  { id: "r2", author: "Phạm Quỳnh Anh", product: "Bộ quà tặng Người Thương", rating: 5, content: "Đóng gói đẹp, người nhận rất thích.", date: "2026-11-03", status: "approved", reply: "Cảm ơn bạn đã tin tưởng Dịu Em!" },
  { id: "r3", author: "Võ Thanh Hà", product: "Sữa rửa mặt Dịu Nhẹ", rating: 3, content: "Dùng ổn nhưng hơi ít bọt so với mong đợi.", date: "2026-11-02", status: "pending", reply: "" },
  { id: "r4", author: "Ẩn danh", product: "Toner Hoa Cúc", rating: 1, content: "Nội dung có từ ngữ không phù hợp.", date: "2026-11-01", status: "hidden", reply: "" },
  { id: "r5", author: "Ngô Khánh Linh", product: "Kem dưỡng ẩm Ban Đêm", rating: 4, content: "Thấm nhanh, sáng da ra, sẽ mua lại.", date: "2026-10-31", status: "approved", reply: "" },
];

export type AdminVoucher = { id: string; code: string; type: "percent" | "fixed"; value: number; minOrder: number; used: number; limit: number; expires: string; active: boolean };
export const adminVouchers: AdminVoucher[] = [
  { id: "v1", code: "DIUEM10", type: "percent", value: 10, minOrder: 300000, used: 128, limit: 500, expires: "2026-12-31", active: true },
  { id: "v2", code: "FREESHIP", type: "fixed", value: 30000, minOrder: 200000, used: 342, limit: 1000, expires: "2026-11-30", active: true },
  { id: "v3", code: "THANHVIEN50", type: "fixed", value: 50000, minOrder: 500000, used: 41, limit: 200, expires: "2026-11-15", active: true },
  { id: "v4", code: "BLACKFRIDAY", type: "percent", value: 25, minOrder: 400000, used: 0, limit: 300, expires: "2026-11-28", active: false },
];

export type AdminBanner = { id: string; slot: string; title: string; link: string; active: boolean };
export const adminBanners: AdminBanner[] = [
  { id: "b1", slot: "Trang chủ – Hero 1", title: "Dịu Em – Motherhood & Women Care", link: "/san-pham", active: true },
  { id: "b2", slot: "Trang chủ – Hero 2", title: "Bộ sưu tập Hoa Bưởi Thế hệ Mới", link: "/san-pham/cham-soc-toc", active: true },
  { id: "b3", slot: "Trang chủ – Quà tặng", title: "Quà tặng người thương", link: "/san-pham/qua-tang-nguoi-thuong", active: true },
  { id: "b4", slot: "Mega menu – Ảnh 1", title: "Ảnh menu 1", link: "/san-pham", active: false },
  { id: "b5", slot: "Mega menu – Ảnh 2", title: "Ảnh menu 2", link: "/san-pham", active: false },
];

/** Khớp bảng `roles` trong Supabase: admin (toàn quyền, được coi là có mọi role), catalog (sản phẩm/danh mục), orders (đơn hàng/khách/voucher). */
export type AdminRole = "admin" | "catalog" | "orders";
export const roleLabel: Record<AdminRole, string> = { admin: "Quản trị viên", catalog: "Quản lý sản phẩm", orders: "Xử lý đơn hàng" };
export type AdminStaff = { id: string; name: string; email: string; role: AdminRole; active: boolean };
export const adminStaff: AdminStaff[] = [
  { id: "s1", name: "Lê Phước Thịnh", email: "thinhlp23416@st.uel.edu", role: "admin", active: true },
  { id: "s2", name: "Nhân viên kho", email: "kho@diuem.vn", role: "catalog", active: true },
  { id: "s3", name: "Nhân viên CSKH", email: "cskh@diuem.vn", role: "orders", active: true },
];

/** Doanh thu 14 ngày gần nhất (VND) – dữ liệu mẫu cho biểu đồ dashboard. */
export const revenueSeries = [
  { d: "22/10", v: 1850000 }, { d: "23/10", v: 2400000 }, { d: "24/10", v: 1200000 }, { d: "25/10", v: 3100000 }, { d: "26/10", v: 2750000 },
  { d: "27/10", v: 1900000 }, { d: "28/10", v: 2200000 }, { d: "29/10", v: 3600000 }, { d: "30/10", v: 2950000 }, { d: "31/10", v: 1700000 },
  { d: "01/11", v: 2800000 }, { d: "02/11", v: 3900000 }, { d: "03/11", v: 3300000 }, { d: "04/11", v: 2600000 },
];

export const defaultSettings = {
  storeName: "Dịu Em",
  hotline: "082 7747 627",
  email: "info@diuem.com",
  freeShipFrom: 300000,
  shippingFee: 30000,
  returnDays: 7,
  maintenance: false,
};
