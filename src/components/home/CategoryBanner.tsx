import { ExploreButton } from "@/components/ui/ExploreButton";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";

type Props = {
  title: string;
  image: string | null;
  cta: { label?: string; href: string };
};

/**
 * Banner danh mục (Figma Catology, 1728×410): ảnh nền, tiêu đề trắng 44px đổ bóng, nút "Xem chi tiết".
 * Nội dung nằm góc dưới-trái (cách trái 100px, cách đáy 80px).
 */
export function CategoryBanner({ title, image, cta }: Props) {
  return (
    <section aria-label={title} className="relative w-full">
      <div className="mx-auto w-full max-w-[1728px]">
        <div className="relative flex min-h-[300px] items-end lg:h-[410px]">
          <ImageOrPlaceholder src={image} alt={title} label={`Banner danh mục · ${title}`} tone="dark" sizes="100vw" className="absolute inset-0" />
          <div className="relative flex w-full flex-col items-start gap-[17px] px-6 pb-10 lg:px-[100px] lg:pb-20">
            <h2 className="max-w-[831px] text-[clamp(26px,2.55vw,44px)] font-medium leading-tight text-white [text-shadow:0_4px_4px_#000]">{title}</h2>
            <ExploreButton href={cta.href}>{cta.label ?? "Xem chi tiết"}</ExploreButton>
          </div>
        </div>
      </div>
    </section>
  );
}
