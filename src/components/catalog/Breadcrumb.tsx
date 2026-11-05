import Link from "next/link";

export type Crumb = { label: string; href?: string };

function HomeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
      <path d="M6.5 1 .5 6.2h1.6V12h3.1V8.4h2.6V12h3.1V6.2h1.6L6.5 1Z" />
    </svg>
  );
}

/** Breadcrumb (Figma Top-sell): icon nhà xám 13px, chữ 13px/200, mục cuối in đậm. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="px-6 pb-5 pt-[50px] lg:px-[50px]">
      <ol className="flex flex-wrap items-center gap-2 text-[13px] font-extralight leading-4">
        <li>
          <Link href="/" aria-label="Trang chủ" className="grid size-[13px] place-items-center text-muted transition-colors hover:text-brand">
            <HomeIcon />
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {c.href ? (
              <Link href={c.href} className="transition-colors hover:text-brand">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? "font-bold" : undefined}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
