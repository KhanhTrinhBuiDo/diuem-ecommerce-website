import type { Activity } from "@/components/home/ActivitySection";
import type { CategoryTile } from "@/components/home/CategoryTiles";
import type { HeroSlide } from "@/components/home/HeroBanner";
import type { Product } from "@/components/home/ProductCard";
import { homeSectionLinks, mainNav } from "@/config/site";
import { productHref } from "@/data/products";

/**
 * DỮ LIỆU TẠM cho trang chủ (lấy từ Figma). Toàn bộ là placeholder.
 * TODO(supabase): thay bằng truy vấn database (products, collections, posts) ở Giai đoạn 3.
 * TODO(ảnh): đặt ảnh vào public/images/home/ rồi điền đường dẫn vào `image` (vd "/images/home/banner-1.jpg").
 */

export const heroSlides: HeroSlide[] = [
  { id: "hero-1", image: null, alt: "Banner 1", label: "Banner 1 · 1729×615", href: "/new-arrivals" },
  { id: "hero-2", image: null, alt: "Banner 2", label: "Banner 2 · 1729×615", href: "/san-pham" },
  { id: "hero-3", image: null, alt: "Banner 3", label: "Banner 3 · 1729×615", href: "/ve-diu-em" },
];

// 4 thẻ = danh mục lớn (chăm sóc mặt, tóc, cơ thể, ...). Figma chỉ có ảnh nên tên dùng cho alt/aria-label.
// TODO(catalog): thẻ thứ 4 chưa rõ tên/đích → "Danh mục 4" trỏ tạm /san-pham.
export const categoryTiles: CategoryTile[] = [
  { id: "cat-face", name: "Chăm sóc mặt", href: "/san-pham/cham-soc-mat", image: null },
  { id: "cat-hair", name: "Chăm sóc tóc", href: "/san-pham/cham-soc-toc", image: null },
  { id: "cat-body", name: "Chăm sóc cơ thể", href: "/san-pham/cham-soc-co-the", image: null },
  { id: "cat-4", name: "Danh mục 4", href: "/san-pham", image: null },
];

// Sản phẩm mẫu: Figma dùng cùng một mẫu "Dầu Gội Hoa Bưởi Thế Hệ Mới – 250.000 VND" cho mọi ô.
const sample = (id: string): Product => ({
  id,
  name: "Dầu Gội Hoa Bưởi Thế Hệ Mới",
  price: 250000,
  image: null,
  href: productHref("cham-soc-toc", "dau-goi-hoa-buoi-the-he-moi"),
});
export const bestSellers: Product[] = ["bs-1", "bs-2", "bs-3", "bs-4"].map(sample);
export const newProducts: Product[] = ["new-1", "new-2", "new-3", "new-4"].map(sample);
export const giftCombos: Product[] = ["combo-1", "combo-2", "combo-3", "combo-4"].map(sample);

export const homeSections = {
  bestBanner: { title: "BÁN CHẠY NHẤT", image: null, cta: { href: homeSectionLinks.bestSellers.href } },
  bestSellers: { title: "SẢN PHẨM CHÁY HÀNG", viewAllHref: homeSectionLinks.bestSellers.href },
  newBanner: { title: "SẢN PHẨM MỚI", image: null, cta: { href: mainNav[0].href } },
  newProducts: { title: "SẢN PHẨM MỚI VỀ", viewAllHref: mainNav[0].href },
  giftBanner: { title: "QUÀ TẶNG NGƯỜI THƯƠNG", image: null, cta: { href: homeSectionLinks.gifts.href } },
  giftCombos: { title: "COMBO TẶNG NGƯỜI THƯƠNG", viewAllHref: homeSectionLinks.combos.href },
} as const;

// Figma dùng cùng một bài mẫu 3 lần → 3 bản sao tạm.
const activityTemplate = {
  title: "Dịu Em đồng hành cùng 50 sinh viên nữ vượt khó...",
  excerpt:
    "Có các chương trình chuyên biệt như Học bổng cho nữ sinh dân tộc thiểu số, hỗ trợ tài chính giáo dục chính quy cùng các hoạt động hướng nghiệp và tập huấn phát triển kỹ năng cho nữ sinh....",
  image: null,
  href: "/bai-viet",
};
export const activities: Activity[] = [1, 2, 3].map((n) => ({ ...activityTemplate, id: `activity-${n}` }));
export const activitySectionTitle = "CÙNG DỊU EM ĐỒNG HÀNH";

export const brandStory = {
  kicker: "Câu chuyện",
  title: "THƯƠNG HIỆU",
  paragraphs: [
    "Trên hành trình tuổi trẻ, chúng ta cứ mải miết đi về phía trước, mang theo những ước mơ chưa thành hình, những lời hứa chưa kịp thực hiện ....",
    "và cả những nỗi lo chẳng biết tỏ cùng ai.",
  ],
  image: null,
  cta: { href: "/ve-diu-em" },
};
