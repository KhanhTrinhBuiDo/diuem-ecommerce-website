import { ActivitySection } from "@/components/home/ActivitySection";
import { BrandStory } from "@/components/home/BrandStory";
import { CategoryBanner } from "@/components/home/CategoryBanner";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductSection } from "@/components/home/ProductSection";
import {
  activities,
  activitySectionTitle,
  bestSellers,
  brandStory,
  categoryTiles,
  giftCombos,
  heroSlides,
  homeSections as s,
  newProducts,
} from "@/data/home";

/**
 * Trang chủ – thứ tự khối theo Figma:
 * Banner → Danh mục → [Bán chạy nhất] → Cháy hàng → [Sản phẩm mới] → Mới về → [Quà tặng] → Combo → Hoạt động → Câu chuyện thương hiệu.
 * (Header và Footer nằm ở layout.) Dữ liệu tạm ở src/data/home.ts.
 */
export default function HomePage() {
  return (
    <>
      <HeroBanner slides={heroSlides} />
      <CategoryTiles items={categoryTiles} />

      <CategoryBanner {...s.bestBanner} />
      <ProductSection title={s.bestSellers.title} viewAllHref={s.bestSellers.viewAllHref} products={bestSellers} />

      <CategoryBanner {...s.newBanner} />
      <ProductSection title={s.newProducts.title} viewAllHref={s.newProducts.viewAllHref} products={newProducts} />

      <CategoryBanner {...s.giftBanner} />
      <ProductSection title={s.giftCombos.title} viewAllHref={s.giftCombos.viewAllHref} products={giftCombos} />

      <ActivitySection title={activitySectionTitle} items={activities} />
      <BrandStory {...brandStory} />
    </>
  );
}
