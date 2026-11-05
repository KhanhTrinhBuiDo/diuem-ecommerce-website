import { ExploreButton } from "@/components/ui/ExploreButton";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";

type Props = {
  kicker: string;
  title: string;
  paragraphs: string[];
  image: string | null;
  cta: { label?: string; href: string };
};

/**
 * "Câu chuyện thương hiệu" (Figma 1528×450, viền đen 1px, bo 10px):
 * trái: "Câu chuyện" (chữ viết tay) + "THƯƠNG HIỆU"; phải: đoạn văn căn phải 13px + nút Khám phá.
 */
export function BrandStory({ kicker, title, paragraphs, image, cta }: Props) {
  return (
    <section aria-label={`${kicker} ${title}`} className="mx-auto w-full max-w-[1728px] px-6 pb-[100px] pt-[50px] lg:px-[100px]">
      <div className="relative min-h-[450px] overflow-hidden rounded-[10px] border border-black">
        <ImageOrPlaceholder src={image} alt={`${kicker} ${title}`} label="Ảnh nền câu chuyện thương hiệu" tone="dark" sizes="(min-width:1024px) 88vw, 100vw" className="absolute inset-0" />

        <div className="relative flex min-h-[450px] flex-col justify-between gap-10 px-6 pb-10 pt-10 lg:flex-row lg:items-end lg:gap-[clamp(40px,33vw,570px)] lg:pb-24 lg:pl-[109px] lg:pr-[108px] lg:pt-[66px]">
          <div className="flex w-full max-w-[370px] flex-col gap-2.5 text-white [text-shadow:0_4px_4px_#000]">
            <p className="font-script text-[clamp(20px,1.45vw,25px)] leading-[1.44]">{kicker}</p>
            <h2 className="text-[clamp(26px,2.03vw,35px)] font-bold leading-tight">{title}</h2>
          </div>

          <div className="flex w-full max-w-[371px] flex-col items-start gap-10 text-white lg:items-end lg:gap-[125px]">
            <div className="flex w-full max-w-[312px] flex-col gap-0 text-[13px] font-extralight leading-4 lg:text-right">
              {paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <ExploreButton href={cta.href}>{cta.label ?? "Xem chi tiết"}</ExploreButton>
          </div>
        </div>
      </div>
    </section>
  );
}
