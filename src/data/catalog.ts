import type { Product } from "@/components/home/ProductCard";
import { sampleCard } from "@/data/products";
import { siteImage } from "@/data/site-images";

/**
 * DỮ LIỆU TẠM cho trang danh mục sản phẩm.
 * TODO(supabase): thay `collections` bằng bảng `categories`/`collections`, `getProducts` bằng truy vấn `products`.
 * Banner: lấy từ public/images/Product_Catalog/ (xem docs/BAN_DO_ANH.md).
 */

export type Collection = {
  slug: string;
  /** Tên hiển thị ở breadcrumb, vd "Combo Chăm sóc tóc" */
  name: string;
  /** Tiêu đề trang (in hoa), vd "COMBO CHĂM SÓC TÓC" */
  title: string;
  banner: string | null;
};

/** Trang tổng /san-pham */
export const allProductsCollection: Collection = { slug: "tat-ca", name: "Sản phẩm", title: "SẢN PHẨM", banner: null };

/** Các danh mục/bộ sưu tập có route /san-pham/[slug] */
export const collections: Collection[] = [
  { slug: "cham-soc-mat", name: "Chăm sóc mặt", title: "CHĂM SÓC MẶT", banner: siteImage("Product_Catalog/3.Cham_soc_mat") },
  { slug: "cham-soc-toc", name: "Chăm sóc tóc", title: "CHĂM SÓC TÓC", banner: siteImage("Product_Catalog/1.Cham_soc_toc") },
  { slug: "cham-soc-co-the", name: "Chăm sóc cơ thể", title: "CHĂM SÓC CƠ THỂ", banner: siteImage("Product_Catalog/2.Cham_soc_co_the") },
  { slug: "cham-soc-em-be", name: "Chăm sóc em bé", title: "CHĂM SÓC EM BÉ", banner: siteImage("Product_Catalog/4.Cham_soc_em_be") },
  { slug: "combo-cham-soc-toc", name: "Combo Chăm sóc tóc", title: "COMBO CHĂM SÓC TÓC", banner: null },
  { slug: "ban-chay-nhat", name: "Bán chạy nhất", title: "BÁN CHẠY NHẤT", banner: null },
  { slug: "qua-tang-nguoi-thuong", name: "Quà tặng người thương", title: "QUÀ TẶNG NGƯỜI THƯƠNG", banner: siteImage("Product_Catalog/5.Qua_tang") },
  { slug: "combo-tang-nguoi-thuong", name: "Combo tặng người thương", title: "COMBO TẶNG NGƯỜI THƯƠNG", banner: null },
];

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);

/** Sản phẩm mẫu: Figma hiển thị "32 kết quả", mọi ô dùng cùng một mẫu. */
export function getProducts(slug: string, total = 32): Product[] {
  const base = slug === "tat-ca" ? "cham-soc-toc" : slug; // TODO(catalog): sản phẩm thật sẽ có danh mục riêng
  return Array.from({ length: total }, (_, i) => sampleCard(`${slug}-${i + 1}`, base));
}