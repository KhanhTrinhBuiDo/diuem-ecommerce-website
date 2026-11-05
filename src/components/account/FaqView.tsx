"use client";

import { useState } from "react";
import { mockFaqs } from "@/data/account";

/** Accordion câu hỏi thường gặp (Figma: ô viền đen 2px, bo 10px, mũi tên xuống). TODO(content): nội dung thật. */
export function FaqView() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="flex flex-col gap-[11px]">
      {mockFaqs.map((f) => {
        const on = open === f.id;
        return (
          <li key={f.id} className="rounded-[10px] border-2 border-black">
            <h2>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`${f.id}-p`}
                onClick={() => setOpen(on ? null : f.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-[clamp(15px,1.16vw,20px)] sm:px-10"
              >
                {f.q}
                <svg width="17" height="10" viewBox="0 0 17 10" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`flex-none transition-transform ${on ? "rotate-180" : ""}`}>
                  <path d="M1 1l7.5 7.5L16 1" />
                </svg>
              </button>
            </h2>
            <div id={`${f.id}-p`} hidden={!on} className="px-5 pb-5 text-[clamp(14px,1.04vw,18px)] font-light sm:px-10">
              {f.a}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
