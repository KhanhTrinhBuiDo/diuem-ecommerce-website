/** Mũi tên ngang (đường kẻ + đầu mũi) dùng cho nút "Khám phá", "Khám phá ngay". Màu theo `currentColor`. */
export function ArrowRight({ width = 38.58, className = "" }: { width?: number; className?: string }) {
  return (
    <span aria-hidden="true" style={{ width }} className={`relative block h-0 flex-none border-t-2 border-current ${className}`}>
      <span className="absolute -top-[6px] right-0 block size-2.5 origin-top-right rotate-45 border-r-2 border-t-2 border-current" />
    </span>
  );
}
