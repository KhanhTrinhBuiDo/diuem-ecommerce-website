import { Breadcrumb, type Crumb } from "@/components/catalog/Breadcrumb";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ActivitySection } from "@/components/home/ActivitySection";
import { BrandStory } from "@/components/home/BrandStory";
import type { Product } from "@/components/home/ProductCard";
import { HeroBanner } from "@/components/home/HeroBanner";
import type { Collection } from "@/data/catalog";
import { activities, activitySectionTitle, brandStory } from "@/data/home";

type Props = {
  collection: Collection;
  products: Product[];
  crumbs: Crumb[];
  /** Sản phẩm có nhãn "mới" (admin gán): hiện thành khối riêng phía trên, rồi mới tới `products` (tất cả). */
  newProducts?: Product[];
};

/**
 * Trang danh mục sản phẩm (Figma "Product - Catalog"):
 * Banner (1 slide, không mũi tên) → Breadcrumb → Tiêu đề → [Bộ lọc | Lưới sản phẩm + Xem thêm]
 * → "Cùng Dịu Em đồng hành" → "Câu chuyện thương hiệu". Header/Footer nằm ở layout.
 */
export function CatalogPage({ collection, products, crumbs, newProducts }: Props) {
  const hasNew = Boolean(newProducts?.length);
  return (
    <>
      <HeroBanner
        slides={[{ id: `banner-${collection.slug}`, image: collection.banner, alt: `Banner ${collection.name}`, label: `Banner ${collection.name} · 1729×615` }]}
      />
      <Breadcrumb items={crumbs} />
      <h1 className="px-6 py-2.5 text-[clamp(22px,1.85vw,32px)] font-bold leading-tight lg:px-[50px]">{collection.title}</h1>

      <div className="flex flex-col lg:flex-row lg:items-start">
        <FilterSidebar total={products.length + (newProducts?.length ?? 0)} />
        {hasNew ? (
          <div className="min-w-0 flex-1">
            <ProductGrid products={newProducts!} pageSize={8} title="SẢN PHẨM MỚI" id="san-pham-moi" />
            <ProductGrid products={products} title="TẤT CẢ SẢN PHẨM" id="tat-ca-san-pham" />
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>

      <ActivitySection title={activitySectionTitle} items={activities} />
      <BrandStory {...brandStory} />
    </>
  );
}