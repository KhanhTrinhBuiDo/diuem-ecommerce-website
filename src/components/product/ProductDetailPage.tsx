import { Breadcrumb } from "@/components/catalog/Breadcrumb";
import { ActivitySection } from "@/components/home/ActivitySection";
import { BrandStory } from "@/components/home/BrandStory";
import { ProductCard, type Product } from "@/components/home/ProductCard";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductReviews } from "@/components/product/ProductReviews";
import { PinkBar } from "@/components/ui/PinkBar";
import type { Collection } from "@/data/catalog";
import { activities, activitySectionTitle, brandStory } from "@/data/home";
import type { ProductDetail } from "@/data/products";
import { reviews } from "@/data/reviews";

type Props = { product: ProductDetail; collection: Collection; href: string; suggestions: Product[]; related: Product[] };

/**
 * Trang chi tiết sản phẩm (Figma "Product - Details"):
 * Breadcrumb → [Gallery | Thông tin] → dải hồng → Mô tả → dải hồng → "Có thể bạn cũng thích"
 * → dải hồng → Đánh giá → Cùng Dịu Em đồng hành → Câu chuyện thương hiệu.
 */
export function ProductDetailPage({ product, collection, href, suggestions, related }: Props) {
  const average = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Sản phẩm", href: "/san-pham" },
          { label: collection.name, href: `/san-pham/${collection.slug}` },
          { label: product.category },
          { label: product.name },
        ]}
      />
      <div className="mx-auto grid w-full max-w-[1728px] lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} href={href} rating={average} suggestions={suggestions} />
      </div>

      <PinkBar />
      <ProductDescription product={product} />

      <section aria-labelledby="cung-thich" className="mx-auto w-full max-w-[1728px] px-6 py-[50px] lg:px-[100px]">
        <h2 id="cung-thich" className="mb-[30px] text-center text-[clamp(20px,1.85vw,32px)] font-medium">
          CÓ THỂ BẠN CŨNG THÍCH
        </h2>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-[clamp(20px,2.4vw,42px)]">
          {related.slice(0, 4).map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>

      <PinkBar />
      <ProductReviews reviews={reviews} average={average} />

      <ActivitySection title={activitySectionTitle} items={activities} />
      <BrandStory {...brandStory} />
    </>
  );
}
