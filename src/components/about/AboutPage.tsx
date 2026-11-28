import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/ArrowRight";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import { PinkBar } from "@/components/ui/PinkBar";
import { about } from "@/data/about";

const body = "text-[clamp(13px,calc(var(--vw)*0.93),16px)] font-extralight leading-[1.35]";
const h2 = "text-[clamp(18px,calc(var(--vw)*1.27),22px)] font-bold leading-tight";
const wrap = "mx-auto w-full max-w-[1728px] px-6 lg:px-[100px]";

/** Khối "ảnh + chữ" xen kẽ (công nghệ / quy trình): ảnh 562×374. */
function Split({ image, label, title, text, imageRight }: { image: string | null; label: string; title: string; text: string; imageRight?: boolean }) {
  return (
    <section className={`${wrap} grid items-center gap-8 py-10 lg:grid-cols-2 lg:gap-[clamp(32px,calc(var(--vw)*5),90px)] lg:py-[60px]`}>
      <ImageOrPlaceholder src={image} alt={title} label={label} sizes="(min-width:1024px) 40vw, 100vw" className={`aspect-[562/374] w-full max-w-[562px] justify-self-center ${imageRight ? "lg:order-2" : ""}`} />
      <div className="flex max-w-[600px] flex-col gap-4">
        <h2 className={h2}>{title}</h2>
        <p className={body}>{text}</p>
      </div>
    </section>
  );
}

/** Trang "Về Dịu Em – Câu chuyện thương hiệu" (Figma 1728px). Nội dung ở src/data/about.ts. */
export function AboutPage() {
  const { intro, band, journey, pride, tech, process, journeyHead, rows, closing } = about;
  return (
    <>
      <div className="w-full bg-line pb-[10px] pt-[10px] lg:pb-[14px] lg:pt-[14px]">
        {about.banner ? (
          // Chiều cao theo đúng tỉ lệ ảnh (không cắt): width 100%, height auto.
          <Image src={about.banner} alt="Về Dịu Em" width={0} height={0} sizes="calc(var(--vw)*100)" priority className="block h-auto w-full" />
        ) : (
          <ImageOrPlaceholder src={null} alt="Về Dịu Em" label="Banner Về Dịu Em" tone="dark" className="h-[clamp(160px,calc(var(--vw)*23),400px)] w-full" />
        )}
      </div>

      {/* Giới thiệu */}
      <section className={`${wrap} grid items-center gap-10 py-14 lg:grid-cols-[minmax(0,484px)_1fr] lg:justify-center lg:gap-[clamp(40px,calc(var(--vw)*5),90px)] lg:py-[100px]`}>
        <div className="mx-auto w-full max-w-[484px] -rotate-[4.55deg] border-[10px] border-white shadow-[-14px_14px_0_#ff66c4]">
          <ImageOrPlaceholder src={intro.image} alt="Dịu Em" label="Ảnh 1 · 484×605" sizes="(min-width:1024px) 30vw, 90vw" className="aspect-[484/605] w-full" />
        </div>
        <div className="flex max-w-[620px] flex-col gap-4">
          <h1 className="text-[clamp(32px,calc(var(--vw)*3),52px)] font-black leading-none">{intro.title}</h1>
          <p className="font-script text-[clamp(20px,calc(var(--vw)*1.85),32px)] leading-[1.25]">{intro.tagline}</p>
          <p className={body}>{intro.text}</p>
        </div>
      </section>

      {/* Dải ảnh có chữ */}
      <section className="relative w-full">
        <ImageOrPlaceholder src={band.image} alt="" label="Ảnh 2 · dải ngang" className="h-[clamp(220px,calc(var(--vw)*28),480px)] w-full" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,#fff_0%,rgba(255,255,255,0)_30%,rgba(255,255,255,0)_65%,rgba(255,102,196,0.45)_100%)]" />
        <p className="absolute bottom-[8%] left-[6%] font-script text-[clamp(24px,calc(var(--vw)*2.9),50px)] leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]">{band.text}</p>
      </section>

      {/* Hành trình bắt đầu */}
      <section className={`${wrap} grid items-center gap-8 py-14 lg:grid-cols-2 lg:gap-[clamp(32px,calc(var(--vw)*5),90px)] lg:py-[100px]`}>
        <div className="flex max-w-[600px] flex-col gap-4 justify-self-end">
          <h2 className="text-[clamp(18px,calc(var(--vw)*1.27),22px)] font-bold leading-tight">
            {journey.title}
            <br />
            <span className="font-script font-normal">{journey.subtitle}</span>
          </h2>
          <p className={body}>{journey.text}</p>
        </div>
        <ImageOrPlaceholder src={journey.image} alt={journey.title} label="Ảnh 3 · 591×419" sizes="(min-width:1024px) 40vw, 100vw" className="aspect-[591/419] w-full max-w-[591px]" />
      </section>

      {/* Tự hào – vùng nguyên liệu */}
      <section className="relative w-full">
        <ImageOrPlaceholder src={pride.image} alt={pride.title} label="Ảnh 4 · banner vùng nguyên liệu" tone="dark" className="h-[clamp(320px,calc(var(--vw)*32),560px)] w-full" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(74,18,48,0.7)_0%,rgba(74,18,48,0.15)_55%,rgba(255,102,196,0.3)_100%)]" />
        <div className="absolute left-[6%] top-[10%] flex max-w-[min(540px,88%)] flex-col gap-2 text-white">
          <span className="font-script text-[clamp(16px,calc(var(--vw)*1.2),20px)]">{pride.kicker}</span>
          <h2 className="text-[clamp(20px,calc(var(--vw)*1.85),32px)] font-bold leading-tight">{pride.title}</h2>
          <p className="text-[clamp(11px,calc(var(--vw)*0.75),13px)] font-extralight leading-[1.4]">{pride.text}</p>
        </div>
      </section>

      <Split image={tech.image} label="Ảnh 5 · 562×374" title={tech.title} text={tech.text} />
      <Split image={process.image} label="Ảnh 6 · 562×374" title={process.title} text={process.text} imageRight />

      <PinkBar />

      {/* Hành trình đồng hành */}
      <section className={`${wrap} py-14 lg:py-[80px]`}>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="font-script text-[clamp(18px,calc(var(--vw)*1.4),24px)]">{journeyHead.kicker}</span>
          <h2 className="text-[clamp(24px,calc(var(--vw)*2.3),40px)] font-bold leading-tight">{journeyHead.title}</h2>
          <span className="font-script text-[clamp(16px,calc(var(--vw)*1.2),20px)]">{journeyHead.sub}</span>
        </div>

        <ul className="mt-12 flex flex-col gap-14 lg:mt-[70px] lg:gap-[90px]">
          {rows.map((r, i) => (
            <li key={r.href} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-[clamp(32px,calc(var(--vw)*4),70px)]">
              <ImageOrPlaceholder src={r.image} alt={r.title} label={`Ảnh ${7 + i} · 656×478`} sizes="(min-width:1024px) 40vw, 100vw" className={`aspect-[656/478] w-full max-w-[656px] justify-self-center ${i % 2 ? "lg:order-2" : ""}`} />
              <div className="flex max-w-[680px] flex-col gap-4">
                <p className="font-script text-[clamp(16px,calc(var(--vw)*1.2),20px)] leading-snug">{r.lead}</p>
                <h3 className="text-[clamp(18px,calc(var(--vw)*1.5),26px)] font-bold leading-tight">{r.title}</h3>
                <p className={body}>{r.text}</p>
                <Link href={r.href} className="mt-2 inline-flex h-[61px] w-[371px] max-w-full items-center justify-center gap-4 rounded-full border-2 border-black text-[clamp(16px,calc(var(--vw)*1.27),22px)] font-medium transition-colors hover:bg-black hover:text-white">
                  Xem chi tiết
                  <ArrowRight />
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-16 text-center font-script text-[clamp(20px,calc(var(--vw)*1.85),32px)] leading-snug lg:mt-[100px]">
          {closing.line1}
          <br />
          {closing.line2}
        </p>
      </section>
    </>
  );
}
