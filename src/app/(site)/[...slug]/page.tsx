import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";
import { PLACEHOLDER_PAGES } from "@/config/site";

/**
 * Route catch-all CHỈ dành cho các trang trong config/site.ts có `ready: false`.
 * Đường dẫn khác → 404. Khi làm trang thật: tạo thư mục route riêng trong src/app
 * (route cụ thể luôn được ưu tiên hơn catch-all) và đặt `ready: true` trong config.
 */
export const dynamicParams = false;

type Params = { slug: string[] };

const findPage = (slug: string[]) => PLACEHOLDER_PAGES.find((p) => p.href === "/" + slug.join("/"));

export function generateStaticParams(): Params[] {
  return PLACEHOLDER_PAGES.map((p) => ({ slug: p.href.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const page = findPage((await params).slug);
  return { title: page?.label ?? "Dịu Em", robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const page = findPage((await params).slug);
  if (!page) notFound();
  return <PlaceholderPage title={page.label} />;
}
