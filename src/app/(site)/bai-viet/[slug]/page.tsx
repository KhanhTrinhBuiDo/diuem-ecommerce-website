import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/catalog/Breadcrumb";
import { PostBanner } from "@/components/posts/PostBanner";
import { getPost, postBannerBadge, postSeries, posts } from "@/data/posts";

export const dynamicParams = false;
export const generateStaticParams = () => posts.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  return post ? { title: post.title, description: post.quote } : {};
}

/** Bài viết (Figma Post 1–3): Banner → Breadcrumb → Tiêu đề → Trích dẫn (thanh hồng) → Thân bài. */
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const n = posts.indexOf(post) + 1;

  return (
    <article>
      <PostBanner src={post.banner} alt={post.title} label={`Banner bài viết ${n} · 1729×615`} badge={postBannerBadge} />
      <Breadcrumb items={[{ label: "Bài Viết", href: "/bai-viet" }, { label: postSeries.crumb, href: "/bai-viet" }, { label: post.shortTitle }]} />

      <div className="mx-auto w-full max-w-[1328px] px-6 pb-[100px] pt-6 lg:pt-[50px]">
        <h1 className="text-[clamp(22px,calc(var(--vw)*1.85),32px)] font-normal leading-[1.25]">{post.title}</h1>

        <blockquote className="mt-10 border-l-[6px] border-line py-1 pl-5 font-script text-[clamp(16px,calc(var(--vw)*1.04),18px)] leading-[1.5]">{post.quote}</blockquote>

        <div className="mt-10 flex flex-col gap-5 text-base font-extralight leading-5">
          {post.paragraphs.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
