const STAR = "M12 1.8l3 6.9 7.5.7-5.7 5 1.7 7.4L12 17.8 5.5 21.8l1.7-7.4-5.7-5 7.5-.7z";

/** Hàng 5 sao đen, hỗ trợ nửa sao (vd 4.5). */
export function RatingStars({ value, size = 32, className = "" }: { value: number; size?: number; className?: string }) {
  const pct = Math.max(0, Math.min(5, value)) * 20;
  const row = (fill: string) => (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="flex-none" aria-hidden="true">
          <path d={STAR} fill={fill} />
        </svg>
      ))}
    </div>
  );
  return (
    <span role="img" aria-label={`${value.toFixed(1)} trên 5 sao`} className={`relative inline-block ${className}`}>
      {row("#d9d9d9")}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row("#000")}
      </span>
    </span>
  );
}
