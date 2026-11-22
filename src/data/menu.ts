/**
 * Mega menu "SẢN PHẨM" (Figma "Noti - Xem Sản phẩm"). Liên kết trỏ tới danh mục thật (slug trong bảng storefront_categories).
 * TODO(menu): hai ảnh bên phải menu (320×262) chờ ảnh thật.
 */
export type MenuGroup = {
  label: string;
  /** Link tiêu đề nhóm (mũi tên >) */
  href: string;
  items: { label: string; href: string }[];
};

const to = (slug: string) => `/san-pham/${slug}`;
const g = (label: string, slug: string, items: [string, string][]): MenuGroup => ({ label, href: to(slug), items: items.map(([l, s]) => ({ label: l, href: to(s) })) });

export const megaMenu = {
  rows: [
    [
      g("CHĂM SÓC MẶT", "cham-soc-mat", [["Son Dưỡng", "son-duong"], ["Rửa Mặt", "rua-mat"], ["Toner", "toner"], ["Kem Dưỡng", "kem-duong"]]),
      g("CHĂM SÓC TÓC", "cham-soc-toc", [["Dầu Gội", "dau-goi"], ["Dầu Xả", "dau-xa"], ["Dưỡng Tóc", "duong-toc"]]),
      g("CHĂM SÓC CƠ THỂ", "cham-soc-co-the", [["Dưỡng Thể", "duong-the"], ["Làm Sạch Cơ Thể", "lam-sach-co-the"]]),
    ],
    [
      g("NGÀNH KHÁC", "nganh-khac", [["Chăm Sóc Bé", "cham-soc-be"], ["Tinh Dầu", "tinh-dau"], ["Nước Hoa", "nuoc-hoa"]]),
      g("BỘ QUÀ TẶNG", "bo-qua-tang", [["Từ 200K", "qua-tu-200k"], ["Từ 500K", "qua-tu-500k"], ["Từ 1000K", "qua-tu-1000k"]]),
    ],
  ] as MenuGroup[][],
  viewAll: { label: "XEM TẤT CẢ", href: "/san-pham" },
};