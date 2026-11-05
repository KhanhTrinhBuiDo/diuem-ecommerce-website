import type { Product } from "@/components/home/ProductCard";

/**
 * DỮ LIỆU TẠM cho trang chi tiết sản phẩm.
 * TODO(supabase): thay bằng bảng `products` + `product_variants` + `product_images`.
 * TODO(content): nội dung mô tả thật (thành phần, HSD, hướng dẫn...) chờ khách hàng cung cấp.
 */

export type Variant = {
  id: string;
  /** Nhãn hiển thị, vd "450ml" */
  label: string;
  price: number;
  /** false = hết hàng/không chọn được (nút xám) */
  available: boolean;
};

export type ProductDetail = {
  slug: string;
  name: string;
  /** Nhóm sản phẩm hiện ở breadcrumb (vd "Dầu gội"); chưa có trang riêng nên không có link */
  category: string;
  variants: Variant[];
  /** Ảnh gallery; null = placeholder */
  images: (string | null)[];
  /** Ảnh lớn khối mô tả (Figma ~ 862×534) */
  descriptionImage: string | null;
  freeShip: boolean;
  /** Nội dung bảng mô tả (Figma "Mô tả sản phẩm") */
  description: {
    intro: string;
    rows: { label: string; value: string }[];
    footnote: string;
  };
};

const PENDING = "Nội dung đang cập nhật.";

const sampleDetail: ProductDetail = {
  slug: "dau-goi-hoa-buoi-the-he-moi",
  name: "Dầu gội Hoa Bưởi Thế hệ Mới",
  category: "Dầu gội",
  variants: [
    { id: "450ml", label: "450ml", price: 250000, available: true },
    // TODO(variants): Figma có thêm 1 nút xám "450ml" (hết hàng) – tạm đặt dung tích khác để dễ phân biệt.
    { id: "250ml", label: "250ml", price: 160000, available: false },
  ],
  images: [null, null],
  descriptionImage: null,
  freeShip: true,
  description: {
    intro: PENDING,
    rows: [
      { label: "Bộ sưu tập", value: PENDING },
      { label: "Thành phần", value: PENDING },
      { label: "Hạn sử dụng", value: PENDING },
      { label: "Phù hợp với", value: PENDING },
      { label: "Hỗ trợ", value: PENDING },
      { label: "Bảo quản", value: PENDING },
      { label: "Lưu ý", value: PENDING },
    ],
    footnote: "* Proudly Made in Vietnam",
  },
};

/** Tất cả sản phẩm có trang chi tiết (hiện chỉ 1 mẫu; mọi ô trong danh mục đều trỏ về mẫu này). */
export const productDetails: ProductDetail[] = [sampleDetail];

export const getProductDetail = (slug: string) => productDetails.find((p) => p.slug === slug);

/** Giá bán nhỏ nhất còn hàng – dùng cho thẻ danh sách. */
export const defaultVariant = (p: ProductDetail) => p.variants.find((v) => v.available) ?? p.variants[0];

/**
 * Quy ước URL chi tiết sản phẩm: /san-pham/[danh-mục]/[slug].
 * TODO(product-detail): xác nhận URL cuối cùng với khách hàng (có thể đổi thành /san-pham/[slug]).
 */
export const productHref = (collectionSlug: string, productSlug: string) => `/san-pham/${collectionSlug}/${productSlug}`;

/** Sản phẩm mẫu dùng cho thẻ trong danh sách / gợi ý (cùng 1 mẫu). */
export function sampleCard(id: string, collectionSlug = "cham-soc-toc"): Product {
  const d = sampleDetail;
  return { id, name: "Dầu Gội Hoa Bưởi Thế Hệ Mới", price: defaultVariant(d).price, image: null, href: productHref(collectionSlug, d.slug) };
}
