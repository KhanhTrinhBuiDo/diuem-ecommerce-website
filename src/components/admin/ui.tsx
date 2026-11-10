"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { inputCls } from "@/components/admin/shared";

/** Bộ UI dùng chung cho khu quản trị – cùng phong cách Figma: viền đen 2px, bo 10–20px, nút đen bo tròn, dải hồng #FF66C4. */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(22px,2vw,34px)] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm font-light text-black/60">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
      <div aria-hidden="true" className="mt-4 h-[5px] bg-line" />
    </div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[20px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.12)] sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[clamp(15px,1.16vw,18px)] font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, tone = "default" }: { label: string; value: string; hint?: string; tone?: "default" | "pink" | "dark" }) {
  const t = tone === "pink" ? "bg-line text-black" : tone === "dark" ? "bg-black text-white" : "bg-white text-black";
  return (
    <div className={`rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.12)] ${t}`}>
      <p className="text-sm font-light opacity-80">{label}</p>
      <p className="mt-2 text-[clamp(20px,1.85vw,30px)] font-bold leading-tight">{value}</p>
      {hint && <p className="mt-1 text-xs font-light opacity-70">{hint}</p>}
    </div>
  );
}

const badgeTone = {
  green: "border-green-700 text-green-800 bg-green-50",
  amber: "border-amber-600 text-amber-800 bg-amber-50",
  red: "border-red-600 text-red-700 bg-red-50",
  gray: "border-black/40 text-black/60 bg-black/5",
  blue: "border-blue-600 text-blue-800 bg-blue-50",
  pink: "border-brand text-brand bg-pink-50",
};
export function Badge({ tone = "gray", children }: { tone?: keyof typeof badgeTone; children: ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded-full border px-3 py-0.5 text-xs font-medium ${badgeTone[tone]}`}>{children}</span>;
}




export function SearchInput({ value, onChange, placeholder = "Tìm kiếm..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="sr-only">{placeholder}</span>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} w-full min-w-[220px] rounded-full sm:w-[300px]`} />
    </label>
  );
}

/** Bảng cuộn ngang trên mobile. */
export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: string }) {
  return (
    <div className="relative overflow-x-auto rounded-[10px] border-2 border-black">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-black text-white">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-rule [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle">{children}</tbody>
      </table>
      {empty && <p className="p-6 text-center text-sm font-light text-black/60">{empty}</p>}
    </div>
  );
}

/** Hộp thoại gốc <dialog>: Esc đóng, focus được trình duyệt quản lý. */
export function Dialog({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean | "xl" }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto w-[calc(100%-32px)] rounded-[20px] p-0 shadow-[0_4px_30px_rgba(0,0,0,0.35)] backdrop:bg-black/50 ${wide === "xl" ? "max-w-[1100px]" : wide ? "max-w-[820px]" : "max-w-[560px]"}`}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b-4 border-line px-6 py-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Đóng" className="grid size-8 place-items-center rounded-full hover:bg-black/10">
              <svg width="14" height="14" viewBox="0 0 14 14" stroke="#000" strokeWidth="2" aria-hidden="true">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-6 w-11 flex-none rounded-full border-2 border-black transition-colors ${checked ? "bg-line" : "bg-white"}`}>
      <span className={`absolute top-0.5 size-4 rounded-full bg-black transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

