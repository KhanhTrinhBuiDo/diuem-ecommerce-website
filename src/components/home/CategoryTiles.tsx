import Link from "next/link";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";

export type CategoryTile = { id: string; name: string; href: string; image: string | null };

/**
 * Hàng danh mục (Figma List-Catology): 4 thẻ 300×450, bo 10px, cách nhau 75px, canh giữa.
 * Figma chỉ có ảnh, không có chữ → tên danh mục chỉ dùng cho aria-label/alt.
 */
export function CategoryTiles({ items }: { items: CategoryTile[] }) {
  return (
    <section aria-label="Danh mục" className="mx-auto w-full max-w-[1729px] px-6 py-[50px] lg:px-[100px]">
      <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:flex lg:justify-center lg:gap-[clamp(24px,4.3vw,75px)]">
        {items.map((c) => (
          <li key={c.id} className="lg:w-[clamp(200px,17.4vw,300px)]">
            <Link href={c.href} aria-label={c.name} className="block transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <ImageOrPlaceholder src={c.image} alt={c.name} label={c.name} sizes="(min-width:1024px) 17vw, 50vw" className="aspect-[2/3] w-full rounded-[10px]" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
