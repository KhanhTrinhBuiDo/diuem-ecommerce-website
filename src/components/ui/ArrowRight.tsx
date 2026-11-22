export function ArrowRight({
  width = 38.58,
  className = "",
}: {
  width?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ width }}
      className={`relative block h-0 flex-none border-t-2 border-current ${className}`}
    >
      <span className="absolute right-0 top-1/2 block size-2 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-current" />
    </span>
  );
}