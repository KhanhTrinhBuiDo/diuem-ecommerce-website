import type { Metadata } from "next";
import { Breadcrumb } from "@/components/catalog/Breadcrumb";
import { ActivitySection } from "@/components/home/ActivitySection";
import { postHref, postSeries, posts } from "@/data/posts";

export const metadata: Metadata = { title: "Bài viết" };

/** Danh sách bài viết. TODO(blog): thêm chuyên mục/phân trang khi có nhiều hơn một chuyên mục. */
export default function PostsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Bài Viết" }]} />
      <h1 className="px-6 py-2.5 text-[clamp(22px,calc(var(--vw)*1.85),32px)] font-bold leading-tight lg:px-[50px]">BÀI VIẾT</h1>
      <ActivitySection
        title={postSeries.name.toLocaleUpperCase("vi")}
        items={posts.map((p) => ({ id: p.slug, title: p.shortTitle, excerpt: p.quote, image: p.thumb, href: postHref(p.slug) }))}
      />
    </>
  );
}
