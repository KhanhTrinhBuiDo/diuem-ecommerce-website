/**
 * Kiểu dữ liệu + tiện ích dùng chung cho sản phẩm. Dữ liệu thật đọc từ Supabase ở src/lib/storefront.ts.
 */

export type Variant = {
  /** SKU của biến thể (ổn định, dùng làm khóa giỏ hàng) */
  id: string;
  /** Nhãn hiển thị, vd "450 ml", "Túi refill 450 ml" */
  label: string;
  price: number;
  /** false = hết hàng/không chọn được (nút xám) */
  available: boolean;
  /** Biến thể chính (hiện sẵn) */
  isDefault?: boolean;
  /** Ảnh riêng của size này */
  images?: string[];
};

export type ProductDetail = {
  slug: string;
  name: string;
  /** Tên danh mục con hiện ở breadcrumb (vd "Dầu gội") */
  category: string;
  variants: Variant[];
  /** Ảnh gallery; null = placeholder */
  images: (string | null)[];
  /** Ảnh lớn khối mô tả (Figma ~ 862×534); null = ẩn */
  descriptionImage: string | null;
  freeShip: boolean;
  /** Nội dung bảng mô tả (Figma "Mô tả sản phẩm") */
  description: {
    intro: string;
    rows: { label: string; value: string }[];
    footnote: string;
  };
};

/** Biến thể chọn sẵn: biến thể chính còn hàng → còn hàng đầu tiên → đầu tiên. */
export const defaultVariant = (p: { variants: Variant[] }) => p.variants.find((v) => v.isDefault && v.available) ?? p.variants.find((v) => v.available) ?? p.variants[0];

/** URL chi tiết sản phẩm: /san-pham/[danh-mục]/[slug]. TODO(product-detail): xác nhận URL cuối cùng với khách hàng. */
export const productHref = (collectionSlug: string, productSlug: string) => `/san-pham/${collectionSlug}/${productSlug}`;