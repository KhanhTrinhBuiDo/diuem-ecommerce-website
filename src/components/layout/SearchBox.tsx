import { SearchIcon } from "@/components/ui/icons";
import { utilityLinks } from "@/config/site";

type Props = { className?: string; id?: string };

/** Ô tìm kiếm. Form GET → /tim-kiem?q=... (trang kết quả: placeholder, sẽ nối với Supabase sau). */
export function SearchBox({ className = "", id = "site-search" }: Props) {
  return (
    <form
      role="search"
      action={utilityLinks.search.href}
      method="get"
      className={`items-center justify-between gap-4 rounded-[30px] border-2 border-ink py-2.5 pl-5 pr-2.5 lg:h-[63px] lg:w-[233px] lg:gap-[70px] ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Tìm kiếm
      </label>
      <input
        id={id}
        type="search"
        name="q"
        placeholder="Tìm kiếm..."
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-base font-light leading-5 text-ink outline-none placeholder:text-ink"
      />
      <button type="submit" aria-label="Tìm" className="grid size-[18px] flex-none place-items-center text-ink">
        <SearchIcon />
      </button>
    </form>
  );
}
