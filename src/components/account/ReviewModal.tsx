"use client";

import { useEffect, useRef, useState } from "react";
import { OrderItemLine } from "@/components/account/OrderParts";
import type { OrderItem } from "@/data/account";

type Draft = { rating: number; text: string; photos: string[]; video: string | null };
const EMPTY: Draft = { rating: 5, text: "", photos: [], video: null };
const MAX_PHOTOS = 5;

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Chất lượng sản phẩm" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} sao`} onClick={() => onChange(n)} className="p-0.5">
          <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 1.8l3 6.9 7.5.7-5.7 5 1.7 7.4L12 17.8 5.5 21.8l1.7-7.4-5.7-5 7.5-.7z" fill={n <= value ? "#000" : "#d9d9d9"} />
          </svg>
        </button>
      ))}
    </div>
  );
}

/**
 * Popup "Đánh giá sản phẩm" (Figma Feedback). Mỗi sản phẩm của đơn là một khối: chưa đánh giá → form; đã đánh giá → "Sửa / Xem lại".
 * TODO(supabase): ghi bảng `reviews` + upload ảnh/video lên Supabase Storage (giới hạn dung lượng, kiểm tra loại file ở server).
 */
export function ReviewModal({ open, onClose, items, onDone }: { open: boolean; onClose: () => void; items: OrderItem[]; onDone?: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setDone(Object.fromEntries(items.map((i) => [i.id, i.reviewed])));
      setDrafts({});
      setEditing(null);
      setViewing(null);
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open, items]);

  const draft = (id: string): Draft => drafts[id] ?? EMPTY;
  const patch = (id: string, p: Partial<Draft>) => setDrafts((s) => ({ ...s, [id]: { ...draft(id), ...p } }));

  function addPhotos(id: string, files: FileList | null) {
    if (!files) return;
    const names = [...files].map((f) => f.name);
    patch(id, { photos: [...draft(id).photos, ...names].slice(0, MAX_PHOTOS) });
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="review-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[92vh] w-[min(1494px,94vw)] overflow-y-auto bg-white p-0 backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-8 px-5 py-8 sm:px-[100px] sm:py-[50px]">
        <h2 id="review-title" className="text-[clamp(22px,1.85vw,32px)] font-bold">
          Đánh giá sản phẩm
        </h2>

        {items.map((it) => {
          const d = draft(it.id);
          const isDone = done[it.id] && editing !== it.id;
          return (
            <section key={it.id} className="border border-black py-6">
              <div className="px-5 py-5 shadow-[0_4px_30px_rgba(0,0,0,0.15)] sm:px-[50px]">
                <OrderItemLine item={it} badge={isDone ? "Đã đánh giá" : undefined} />
              </div>

              {isDone ? (
                <div className="px-5 pt-6 sm:px-[50px]">
                  {viewing === it.id && (
                    <p className="mb-4 text-[clamp(13px,1.04vw,18px)] font-light">
                      {/* TODO(reviews): hiển thị nội dung đánh giá thật từ bảng `reviews`. */}
                      Chất lượng sản phẩm: {"★".repeat(d.rating)} — {d.text || "Nội dung đánh giá sẽ hiện ở đây."}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-8">
                    <button type="button" onClick={() => setEditing(it.id)} className="text-[clamp(14px,1.27vw,22px)] text-muted">
                      Sửa
                    </button>
                    <button
                      type="button"
                      aria-expanded={viewing === it.id}
                      onClick={() => setViewing(viewing === it.id ? null : it.id)}
                      className="h-[57px] rounded-[5px] border-2 border-black px-8 text-[clamp(14px,1.27vw,22px)]"
                    >
                      Xem lại đánh giá
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  className="flex flex-col gap-6 px-5 pt-6 sm:px-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDone((s) => ({ ...s, [it.id]: true }));
                    setEditing(null);
                  }}
                >
                  <div className="flex flex-wrap items-center gap-x-10 gap-y-2">
                    <span className="text-[clamp(14px,1.27vw,22px)] font-light">Chất lượng sản phẩm:</span>
                    <Stars value={d.rating} onChange={(n) => patch(it.id, { rating: n })} />
                  </div>
                  <div className="flex flex-col gap-5">
                    <label htmlFor={`cm-${it.id}`} className="text-[clamp(14px,1.27vw,22px)] font-light">
                      Bình luận:
                    </label>
                    <textarea
                      id={`cm-${it.id}`}
                      value={d.text}
                      maxLength={1000}
                      onChange={(e) => patch(it.id, { text: e.target.value })}
                      placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này với người mua khác nhé."
                      className="h-[196px] w-full resize-none bg-[#f3f3f3] p-6 text-[clamp(14px,1.27vw,22px)] font-light placeholder:text-muted"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-5">
                    <label className="flex h-12 cursor-pointer items-center gap-4 rounded-[3px] border border-line bg-[#fdf6f5] px-4 text-[clamp(13px,1.27vw,22px)] font-light text-line">
                      Thêm ảnh ({MAX_PHOTOS - d.photos.length}/{MAX_PHOTOS})
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(it.id, e.target.files)} disabled={d.photos.length >= MAX_PHOTOS} />
                    </label>
                    <label className="flex h-12 cursor-pointer items-center gap-4 rounded-[3px] border border-line bg-[#fdf5fb] px-4 text-[clamp(13px,1.27vw,22px)] font-light text-line">
                      Thêm video ({d.video ? 0 : 1}/1)
                      <input type="file" accept="video/*" className="sr-only" onChange={(e) => patch(it.id, { video: e.target.files?.[0]?.name ?? null })} disabled={!!d.video} />
                    </label>
                  </div>
                  {(d.photos.length > 0 || d.video) && <p className="break-all text-sm text-black/60">Đã chọn: {[...d.photos, d.video].filter(Boolean).join(", ")} (chưa tải lên máy chủ)</p>}
                  <div className="flex items-center justify-end gap-6">
                    <button type="button" onClick={() => setDrafts((s) => ({ ...s, [it.id]: EMPTY }))} className="text-[clamp(14px,1.27vw,22px)] text-muted">
                      Làm mới
                    </button>
                    <button type="submit" className="h-[57px] rounded-[5px] bg-black px-8 text-[clamp(14px,1.27vw,22px)] text-white">
                      Đánh giá sản phẩm
                    </button>
                  </div>
                </form>
              )}
            </section>
          );
        })}

        <div className="flex items-center justify-end gap-[75px]">
          <button type="button" onClick={onClose} className="text-[clamp(18px,1.62vw,28px)] text-muted">
            Trở lại
          </button>
          <button
            type="button"
            onClick={() => {
              onDone?.();
              onClose();
            }}
            className="h-[75px] w-[min(256px,50%)] rounded-[5px] border-2 border-black bg-line text-[clamp(18px,1.62vw,28px)] text-white [text-shadow:0_4px_20px_#000]"
          >
            Hoàn thành
          </button>
        </div>
      </div>
    </dialog>
  );
}
