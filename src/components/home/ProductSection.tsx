import Link from "next/link";
import { ProductCard, type Product } from "@/components/home/ProductCard";

type Props = {
  title: string;
  viewAllHref: string;
  products: Product[];
};

/**
 * Hàng sản phẩm (Figma Item-bar): tiêu đề 32px + link "Xem đầy đủ" gạch chân,
 * bên dưới là 4 thẻ sản phẩm cách nhau 42px.
 */
export function ProductSection({ title, viewAllHref, products }: Props) {
  return (
    <section aria-label={title} className="mx-auto flex w-full max-w-[1729px] flex-col items-center gap-[21px] px-6 py-[50px] lg:px-[100px]">
      <div className="flex w-full max-w-[1531px] items-end justify-between gap-4 lg:gap-[42px]">
        <h2 className="text-[clamp(20px,1.85vw,32px)] font-medium leading-tight">{title}</h2>
        <Link href={viewAllHref} className="flex-none whitespace-nowrap text-right text-base font-medium leading-5 underline transition-colors hover:text-brand">
          Xem đầy đủ
        </Link>
      </div>
      <ul className="grid w-full max-w-[1529px] grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-[clamp(20px,2.4vw,42px)]">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
