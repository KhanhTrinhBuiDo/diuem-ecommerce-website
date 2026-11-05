/** Hằng số dùng được cả ở server lẫn client (file "use client" không export được hằng cho server). */
export { formatVND as money } from "@/lib/format";

export const btn = {
  primary: "inline-flex h-10 items-center justify-center rounded-full bg-black px-6 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-40",
  outline: "inline-flex h-10 items-center justify-center rounded-full border-2 border-black bg-white px-5 text-sm font-medium transition-colors hover:bg-black hover:text-white disabled:opacity-40",
  danger: "inline-flex h-10 items-center justify-center rounded-full border-2 border-red-600 bg-white px-5 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white",
  small: "inline-flex h-8 items-center justify-center rounded-full border border-black px-3 text-xs font-medium transition-colors hover:bg-black hover:text-white",
};

export const inputCls = "h-11 w-full rounded-[10px] border border-black bg-white px-4 text-sm font-light placeholder:text-black/40";
