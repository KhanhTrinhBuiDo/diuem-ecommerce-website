import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import type { ProductDetail } from "@/data/products";

/** "MÔ TẢ SẢN PHẨM" (Figma): bảng thông tin bên trái, ảnh lớn bên phải. */
export function ProductDescription({ product }: { product: ProductDetail }) {
  const d = product.description;
  return (
    <section id="mo-ta-san-pham" aria-labelledby="mo-ta" className="mx-auto w-full max-w-[1728px] scroll-mt-4 px-6 py-[50px] lg:px-[100px]">
      <h2 id="mo-ta" className="mb-[30px] text-center text-[clamp(20px,1.85vw,32px)] font-medium">
        MÔ TẢ SẢN PHẨM
      </h2>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-10">
        <div className="flex flex-col gap-3">
          <h3 className="text-[clamp(18px,1.45vw,25px)] font-bold">{product.name}</h3>
          <p className="text-sm font-extralight">{d.intro}</p>
          <dl className="divide-y divide-rule border-y border-rule text-sm">
            {d.rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[110px_1fr] gap-3 py-2.5">
                <dt className="font-bold">{r.label}:</dt>
                <dd className="font-extralight">{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm font-bold">{d.footnote}</p>
        </div>
        <ImageOrPlaceholder src={product.descriptionImage} alt={`Mô tả ${product.name}`} label="Ảnh mô tả sản phẩm · 862×534" className="aspect-[862/534] w-full shadow-[0_4px_20px_rgba(0,0,0,0.25)]" sizes="(min-width:1024px) 55vw, 100vw" />
      </div>
    </section>
  );
}
