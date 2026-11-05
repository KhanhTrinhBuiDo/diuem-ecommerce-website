/**
 * Mega menu "SẢN PHẨM" (Figma "Noti - Xem Sản phẩm").
 * TODO(menu): các mục con chưa có trang riêng → tạm trỏ về /san-pham; nối vào danh mục thật khi có Supabase.
 * TODO(menu): hai ảnh bên phải menu (320×262) chờ ảnh thật.
 */
export type MenuGroup = {
  label: string;
  /** Link tiêu đề nhóm (mũi tên >) */
  href: string;
  /** slug collection dùng lấy sản phẩm mẫu khi rê vào tiêu đề nhóm */
  collection: string;
  items: { label: string; href: string }[];
};

const ALL = "/san-pham";

export const megaMenu = {
  rows: [
    [
      { label: "CHĂM SÓC MẶT", href: "/san-pham/cham-soc-mat", collection: "cham-soc-mat", items: ["Son Dưỡng", "Rửa Mặt", "Toner", "Kem Dưỡng"] },
      { label: "CHĂM SÓC TÓC", href: "/san-pham/cham-soc-toc", collection: "cham-soc-toc", items: ["Dầu Gội", "Dầu Xả", "Dưỡng Tóc"] },
      { label: "CHĂM SÓC CƠ THỂ", href: "/san-pham/cham-soc-co-the", collection: "cham-soc-co-the", items: ["Dưỡng Thể", "Làm Sạch Cơ Thể"] },
    ],
    [
      { label: "NGÀNH KHÁC", href: ALL, collection: "tat-ca", items: ["Chăm Sóc Bé", "Tinh Dầu", "Nước Hoa"] },
      { label: "BỘ QUÀ TẶNG", href: ALL, collection: "qua-tang-nguoi-thuong", items: ["Từ 200K", "Từ 500K", "Từ 1000K"] },
    ],
  ].map((row) => row.map((g) => ({ ...g, items: g.items.map((label) => ({ label, href: ALL })) }))) as MenuGroup[][],
  viewAll: { label: "XEM TẤT CẢ", href: ALL },
};
