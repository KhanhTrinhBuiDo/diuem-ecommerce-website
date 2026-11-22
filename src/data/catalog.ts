import { siteImage } from "@/data/site-images";

/**
 * Thông tin trang danh mục. Danh mục + sản phẩm thật đọc từ Supabase (src/lib/storefront.ts);
 * file này chỉ giữ kiểu và ảnh banner (xem docs/BAN_DO_ANH.md).
 */

export type Collection = {
  slug: string;
  /** Tên hiển thị ở breadcrumb, vd "Chăm sóc tóc" */
  name: string;
  /** Tiêu đề trang (in hoa), vd "CHĂM SÓC TÓC" */
  title: string;
  banner: string | null;
};

/** Trang tổng /san-pham */
export const allProductsCollection: Collection = { slug: "tat-ca", name: "Sản phẩm", title: "SẢN PHẨM", banner: null };
/** Trang /new-arrivals */
export const newArrivalsCollection: Collection = { slug: "new-arrivals", name: "New Arrivals", title: "NEW ARRIVALS", banner: null };

const banners: Record<string, string | null> = {
  "cham-soc-mat": siteImage("Product_Catalog/3.Cham_soc_mat"),
  "cham-soc-toc": siteImage("Product_Catalog/1.Cham_soc_toc"),
  "cham-soc-co-the": siteImage("Product_Catalog/2.Cham_soc_co_the"),
  "cham-soc-be": siteImage("Product_Catalog/4.Cham_soc_em_be"),
  "bo-qua-tang": siteImage("Product_Catalog/5.Qua_tang"),
};
/** Banner theo slug danh mục (danh mục con không có banner riêng sẽ dùng banner của danh mục cha). */
export const collectionBanner = (slug: string): string | null => banners[slug] ?? null;