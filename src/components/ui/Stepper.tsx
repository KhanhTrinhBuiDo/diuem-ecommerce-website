type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  /** "plain": không viền (trang sản phẩm) – "pill": viền đen bo tròn (giỏ hàng) */
  variant?: "plain" | "pill";
  label?: string;
};

/** Bộ chỉnh số lượng − 1 +. */
export function Stepper({ value, onChange, min = 1, max = 99, variant = "plain", label = "Số lượng" }: Props) {
  const btn = "grid size-[34px] place-items-center text-xl font-bold leading-none transition-colors hover:text-brand disabled:opacity-30 disabled:hover:text-black";
  return (
    <div role="group" aria-label={label} className={`inline-flex items-center ${variant === "pill" ? "rounded-full border-2 border-black px-1" : ""}`}>
      <button type="button" className={btn} aria-label="Giảm" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        −
      </button>
      <output aria-live="polite" className="min-w-[2.5ch] px-2 text-center text-[clamp(16px,1.16vw,20px)] font-bold">
        {value}
      </output>
      <button type="button" className={btn} aria-label="Tăng" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        +
      </button>
    </div>
  );
}
