import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type Common = { label: string; error?: string; className?: string };

/** Ô nhập kiểu giỏ hàng (Figma Frame 137/138): nhãn 15px + ô bo tròn viền đen 1px. */
export function Field({ label, error, className = "", id, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const fid = id ?? `f-${props.name}`;
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={fid} className="px-4 py-[5px] text-[15px] leading-[19px] lg:px-[50px]">
        {label}
      </label>
      <input
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : undefined}
        className="h-[62px] w-full rounded-full border border-black bg-white px-6 text-[clamp(15px,1.04vw,18px)] font-extralight placeholder:text-black/70 lg:pl-[50px] lg:pr-2.5"
        {...props}
      />
      {error && (
        <p id={`${fid}-err`} role="alert" className="px-4 pt-1 text-sm text-red-600 lg:px-[50px]">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextAreaField({ label, className = "", id, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fid = id ?? `f-${props.name}`;
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={fid} className="px-4 py-[5px] text-[15px] leading-[19px] lg:px-[50px]">
        {label}
      </label>
      <textarea
        id={fid}
        rows={5}
        className="h-[167px] w-full resize-none rounded-[20px] border border-black bg-white px-6 py-5 text-[clamp(15px,1.04vw,18px)] font-extralight placeholder:text-black/70 lg:pl-[50px] lg:pr-2.5"
        {...props}
      />
    </div>
  );
}
