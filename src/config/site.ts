
/**
 * Cấu hình tập trung cho site: menu, link footer, liên hệ, mạng xã hội.
 * Sửa nội dung ở đây thay vì sửa trong component.
 *
 * `ready: false` = trang đích CHƯA được xây → hiện trang placeholder (xem app/[...slug]/page.tsx).
 * Khi làm xong một trang thật, đặt `ready: true` và tạo route tương ứng trong src/app.
 */

export type NavLink = { label: string; href: string; ready: boolean };
export type LinkGroup = { title: string; links: NavLink[] };

export const siteConfig = {
  name: "Dịu Em",
  tagline: "Dịu dàng với em, như cách em dịu dàng với cả thế giới.",
  description:
    "Dịu Em – Motherhood & Women Care Brand. Chăm con bắt đầu từ chăm mẹ.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contact: {
    hotline: "082 7747 627",
    hotlineHref: "tel:0827747627",
    email: "info@diuem.com",
    emailHref: "mailto:info@diuem.com",
  },
  company: {
    name: "CÔNG TY TNHH MAI AN KIM VIỆT NAM",
    legal:
      "Mã số doanh nghiệp: 0110169383. Giấy chứng nhận đăng ký doanh nghiệp do Sở Kế hoạch và Đầu tư TP Hà Nội cấp lần đầu 02/11/2022",
  },
  footerIntro: {
    title: "Dịu Em - Đồng hành cùng em trong mọi khoảnh khắc",
    text: "Theo dõi Dịu Em để cập nhật nhiều sản phẩm và câu chuyện thiết kế và ưu đãi dành riêng cho khách hàng thân thiết.",
    cta: { label: "Khám phá ngay", href: "/san-pham", ready: true } as NavLink,
  },
} as const;

/** Menu chính trên header */
export const mainNav: NavLink[] = [
  { label: "NEW ARRIVALS", href: "/new-arrivals", ready: false },
  { label: "SẢN PHẨM", href: "/san-pham", ready: true },
  { label: "VỀ DỊU EM", href: "/ve-diu-em", ready: false },
  { label: "BÀI VIẾT", href: "/bai-viet", ready: false },
];

/** Các link tiện ích trên header (tìm kiếm / tài khoản / giỏ hàng) */
export const utilityLinks = {
  search: { label: "Tìm kiếm", href: "/tim-kiem", ready: false },
  // Header dùng popup đăng nhập; href này chỉ là dự phòng. TODO(auth): đã đăng nhập → /tai-khoan
  account: { label: "Tài khoản", href: "/dang-nhap", ready: false },
  cart: { label: "Giỏ hàng", href: "/gio-hang", ready: true },
} satisfies Record<string, NavLink>;

/** 4 cột link ở giữa footer + cột chính sách */
export const footerGroups: LinkGroup[] = [
  {
    title: "Cùng Em",
    links: [
      { label: "Đăng ký thành viên", href: "/dang-ky", ready: false },
      { label: "Ưu đãi & đặc quyền", href: "/uu-dai", ready: false },
    ],
  },
  {
    title: "Về Dịu Em",
    links: [
      { label: "Câu chuyện thương hiệu", href: "/ve-diu-em", ready: false },
      { label: "Chất liệu", href: "/chat-lieu", ready: false },
      { label: "Blog", href: "/bai-viet", ready: false },
    ],
  },
  {
    title: "Công ty",
    links: [
      { label: "Tuyển dụng", href: "/tuyen-dung", ready: false },
      { label: "Đăng ký bản quyền", href: "/dang-ky-ban-quyen", ready: false },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Hướng dẫn chọn size", href: "/huong-dan-chon-size", ready: false },
      { label: "Hướng dẫn giặt là", href: "/huong-dan-giat-la", ready: false },
      { label: "Hỏi đáp - FAQs", href: "/faqs", ready: false },
    ],
  },
];

export const policyGroup: LinkGroup = {
  title: "Chính sách",
  links: [
    { label: "Chính sách khách hàng", href: "/chinh-sach-khach-hang", ready: false },
    { label: "Chính sách đổi trả", href: "/chinh-sach-doi-tra", ready: false },
    { label: "Chính sách kiểm hàng", href: "/chinh-sach-kiem-hang", ready: false },
    { label: "Chính sách vận chuyển", href: "/chinh-sach-van-chuyen", ready: false },
    { label: "Chính sách thanh toán", href: "/chinh-sach-thanh-toan", ready: false },
    { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat", ready: false },
  ],
};

/**
 * Trang đích của các khối trên trang chủ (chưa xây).
 * TODO(catalog): khi có database, các trang này có thể gộp thành /san-pham/[danh-muc].
 */
export const homeSectionLinks = {
  bestSellers: { label: "Bán chạy nhất", href: "/san-pham/ban-chay-nhat", ready: true },
  gifts: { label: "Quà tặng người thương", href: "/san-pham/qua-tang-nguoi-thuong", ready: true },
  combos: { label: "Combo tặng người thương", href: "/san-pham/combo-tang-nguoi-thuong", ready: true },
} satisfies Record<string, NavLink>;

/** Mạng xã hội. TODO: thay "#" bằng URL thật khi có. */
export const socialLinks: { label: string; key: "facebook" | "tiktok" | "instagram"; href: string }[] = [
  { label: "Facebook", key: "facebook", href: "#" },
  { label: "TikTok", key: "tiktok", href: "#" },
  { label: "Instagram", key: "instagram", href: "#" },
];

/** Liên kết huy hiệu Bộ Công Thương. TODO: thay bằng link xác nhận thông báo thật của shop. */
export const moitBadgeHref = "http://online.gov.vn";

/**
 * Danh sách trang placeholder: gom mọi link `ready: false` (bỏ trùng).
 * Dùng cho route catch-all để không bị 404 khi bấm vào link chưa làm.
 */
export const PLACEHOLDER_PAGES: NavLink[] = (() => {
  const all: NavLink[] = [
    ...mainNav,
    ...Object.values(utilityLinks),
    ...footerGroups.flatMap((g) => g.links),
    ...policyGroup.links,
    ...Object.values(homeSectionLinks),
    siteConfig.footerIntro.cta,
  ];
  const seen = new Set<string>();
  return all.filter((l) => {
    if (l.ready || seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });
})();

