import type { InputHTMLAttributes } from "react";

/** Ô chọn kiểu Figma: vuông 25×25, viền đen 2px, bo 3px, khi chọn có ô đen 15×15 bên trong. */
export function Checkbox({ className = "", ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <input
      type="checkbox"
      className={`size-[25px] flex-none cursor-pointer appearance-none rounded-[3px] border-2 border-black bg-white p-[3px] checked:bg-black checked:[background-clip:content-box] ${className}`}
      {...props}
    />
  );
}
