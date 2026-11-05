import Link from "next/link";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";

export type Activity = { id: string; title: string; excerpt: string; image: string | null; href: string };

/**
 * "CÙNG DỊU EM ĐỒNG HÀNH" (Figma Activity): thanh nhấn hồng 609×6, tiêu đề 44px,
 * 3 thẻ (ảnh 479×350, tiêu đề 25px/700, mô tả 16px/200).
 * TODO(blog): href sẽ trỏ tới bài viết thật khi có bảng `posts`.
 */
export function ActivitySection({ title, items }: { title: string; items: Activity[] }) {
  return (
    <section aria-label={title} className="mx-auto flex w-full max-w-[1728px] flex-col items-start gap-[clamp(24px,2.9vw,50px)] px-6 py-[50px] lg:px-[100px]">
      <span aria-hidden="true" className="block h-[6px] w-[609px] max-w-full bg-brand" />
      <h2 className="text-[clamp(24px,2.55vw,44px)] font-medium leading-tight">{title}</h2>

      <ul className="grid w-full max-w-[1528px] gap-10 md:grid-cols-3 lg:gap-[clamp(24px,4vw,70px)]">
        {items.map((a) => (
          <li key={a.id}>
            <Link href={a.href} className="group flex flex-col gap-5">
              <ImageOrPlaceholder src={a.image} alt={a.title} label="Ảnh hoạt động" sizes="(min-width:768px) 28vw, 100vw" className="aspect-[479/350] w-full transition-opacity group-hover:opacity-90" />
              <h3 className="text-[clamp(18px,1.45vw,25px)] font-bold leading-[1.24] transition-colors group-hover:text-brand">{a.title}</h3>
              <p className="text-base font-extralight leading-5">{a.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
