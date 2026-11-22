import { ActivitySection } from "@/components/home/ActivitySection";
import { BrandStory } from "@/components/home/BrandStory";
import { CategoryBanner } from "@/components/home/CategoryBanner";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { HeroBanner } from "@/components/home/HeroBanner";
import { getCatalog, newOf, toCard, type CatalogProduct } from "@/lib/storefront";
import { ProductSection } from "@/components/home/ProductSection";
import {
  activities,
  activitySectionTitle,
  brandStory,
  categoryTiles,
  heroSlides,
  homeSections as s,
} from "@/data/home";

/**
 * Trang chủ – thứ tự khối theo Figma:
 * Banner → Danh mục → [Bán chạy nhất] → Cháy hàng → [Sản phẩm mới] → Mới về → [Quà tặng] → Combo → Hoạt động → Câu chuyện thương hiệu.
 * (Header và Footer nằm ở layout.) Dữ liệu tạm ở src/data/home.ts.
 */
export const revalidate = 60;

const pick = (ps: CatalogProduct[], n = 4) => ps.slice(0, n).map(toCard);

export default async function HomePage() {
  const { products } = await getCatalog();
  // Chưa có số liệu bán hàng: "Bán chạy" = sản phẩm admin đánh dấu nổi bật, thiếu thì bù bằng sản phẩm còn lại. TODO(orders): theo số bán thật.
  const featured = products.filter((p) => p.isFeatured);
  const best = pick([...featured, ...products.filter((p) => !p.isFeatured)]);
  const fresh = pick(newOf(products));
  const gifts = pick(products.filter((p) => p.parent?.slug === "bo-qua-tang"));
  return (
    <>
      <HeroBanner slides={heroSlides} />
      <CategoryTiles items={categoryTiles} />

      {best.length > 0 && (
        <>
          <CategoryBanner {...s.bestBanner} />
          <ProductSection title={s.bestSellers.title} viewAllHref={s.bestSellers.viewAllHref} products={best} />
        </>
      )}
      {fresh.length > 0 && (
        <>
          <CategoryBanner {...s.newBanner} />
          <ProductSection title={s.newProducts.title} viewAllHref={s.newProducts.viewAllHref} products={fresh} />
        </>
      )}
      {gifts.length > 0 && (
        <>
          <CategoryBanner {...s.giftBanner} />
          <ProductSection title={s.giftCombos.title} viewAllHref={s.giftCombos.viewAllHref} products={gifts} />
        </>
      )}

      <ActivitySection title={activitySectionTitle} items={activities} />
      <BrandStory {...brandStory} />
    </>
  );
}
