"use client";

import { useEffect, useRef, useState } from "react";
import { submitReview } from "@/app/(site)/tai-khoan/actions";
import { OrderItemLine } from "@/components/account/OrderParts";
import type { OrderItem } from "@/data/account";

type Saved = { rating: number; content: string; canEdit: boolean };
type Draft = { rating: number; text: string };
const EMPTY: Draft = { rating: 5, text: "" };
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
 * Popup "Đánh giá sản phẩm" (Figma Feedback). Mỗi sản phẩm của đơn là một khối: chưa đánh giá → form; đã đánh giá → "Sửa (1 lần) / Xem lại".
 * Ghi qua server action `submitReview` → hàm SQL `submit_review`.
 * TODO(media): thêm ảnh/video cho đánh giá cần luồng upload riêng (Cloudinary signed upload cho khách + kiểm duyệt) – tạm ẩn.
 */
export function ReviewModal({ open, onClose, items, onDone }: { open: boolean; onClose: () => void; items: OrderItem[]; onDone?: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [saved, setSaved] = useState<Record<string, Saved>>({});
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [changed, setChanged] = useState(false);
  const list = items.filter((i) => i.itemId);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setSaved(Object.fromEntries(list.filter((i) => i.review).map((i) => [i.itemId!, i.review!])));
      setDrafts({});
      setEditing(null);
      setViewing(null);
      setErrs({});
      setChanged(false);
      d.showModal();
    }
    if (!open && d.open) d.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items]);

  const draft = (id: string): Draft => drafts[id] ?? (saved[id] ? { rating: saved[id].rating, text: saved[id].content } : EMPTY);
  const patch = (id: string, p: Partial<Draft>) => setDrafts((s) => ({ ...s, [id]: { ...draft(id), ...p } }));

  async function send(id: string) {
    const d = draft(id);
    setBusy(id);
    setErrs((e) => ({ ...e, [id]: "" }));
    const r = await submitReview(id, d.rating, d.text).catch(() => ({ ok: false as const, error: "Không kết nối được máy chủ." }));
    setBusy(null);
    if (!r.ok) return setErrs((e) => ({ ...e, [id]: r.error }));
    setSaved((s) => ({ ...s, [id]: { rating: d.rating, content: d.text.trim(), canEdit: !s[id] } }));
    setEditing(null);
    setChanged(true);
  }

  function close() {
    if (changed) onDone?.();
    onClose();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="review-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && close()}
      className="m-auto max-h-[92vh] w-[min(1494px,94vw)] overflow-y-auto bg-white p-0 backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-8 px-5 py-8 sm:px-[100px] sm:py-[50px]">
        <h2 id="review-title" className="text-[clamp(22px,1.85vw,32px)] font-bold">
          Đánh giá sản phẩm
        </h2>
        {list.length === 0 && <p className="font-light">Vui lòng đăng nhập bằng tài khoản đã đặt đơn này để đánh giá sản phẩm.</p>}

        {list.map((it) => {
          const id = it.itemId!;
          const d = draft(id);
          const sv = saved[id];
          const isDone = !!sv && editing !== id;
          return (
            <section key={id} className="border border-black py-6">
              <div className="px-5 py-5 shadow-[0_4px_30px_rgba(0,0,0,0.15)] sm:px-[50px]">
                <OrderItemLine item={it} badge={isDone ? "Đã đánh giá" : undefined} />
              </div>

              {isDone ? (
                <div className="px-5 pt-6 sm:px-[50px]">
                  {viewing === id && (
                    <p className="mb-4 text-[clamp(13px,1.04vw,18px)] font-light">
                      Chất lượng sản phẩm: {"★".repeat(sv.rating)}{"☆".repeat(5 - sv.rating)}{sv.content ? ` — ${sv.content}` : ""}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-8">
                    {sv.canEdit ? (
                      <button type="button" onClick={() => setEditing(id)} className="text-[clamp(14px,1.27vw,22px)] text-muted">
                        Sửa (còn 1 lần)
                      </button>
                    ) : (
                      <span className="text-[clamp(13px,1.04vw,18px)] font-light text-black/50">Đã sửa 1 lần</span>
                    )}
                    <button
                      type="button"
                      aria-expanded={viewing === id}
                      onClick={() => setViewing(viewing === id ? null : id)}
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
                    void send(id);
                  }}
                >
                  {sv && <p className="text-sm text-black/60">Bạn chỉ được sửa đánh giá này một lần.</p>}
                  <div className="flex flex-wrap items-center gap-x-10 gap-y-2">
                    <span className="text-[clamp(14px,1.27vw,22px)] font-light">Chất lượng sản phẩm:</span>
                    <Stars value={d.rating} onChange={(n) => patch(id, { rating: n })} />
                  </div>
                  <div className="flex flex-col gap-5">
                    <label htmlFor={`cm-${id}`} className="text-[clamp(14px,1.27vw,22px)] font-light">
                      Bình luận:
                    </label>
                    <textarea
                      id={`cm-${id}`}
                      value={d.text}
                      maxLength={1000}
                      onChange={(e) => patch(id, { text: e.target.value })}
                      placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này với người mua khác nhé."
                      className="h-[196px] w-full resize-none bg-[#f3f3f3] p-6 text-[clamp(14px,1.27vw,22px)] font-light placeholder:text-muted"
                    />
                  </div>
                  {errs[id] && <p role="alert" className="text-sm text-red-600">{errs[id]}</p>}
                  <div className="flex items-center justify-end gap-6">
                    {sv ? (
                      <button type="button" onClick={() => { setEditing(null); setDrafts((s) => { const { [id]: _x, ...rest } = s; return rest; }); }} className="text-[clamp(14px,1.27vw,22px)] text-muted">
                        Hủy
                      </button>
                    ) : (
                      <button type="button" onClick={() => setDrafts((s) => ({ ...s, [id]: EMPTY }))} className="text-[clamp(14px,1.27vw,22px)] text-muted">
                        Làm mới
                      </button>
                    )}
                    <button type="submit" disabled={busy === id} className="h-[57px] rounded-[5px] bg-black px-8 text-[clamp(14px,1.27vw,22px)] text-white disabled:opacity-50">
                      {busy === id ? "Đang gửi…" : sv ? "Lưu chỉnh sửa" : "Đánh giá sản phẩm"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          );
        })}

        <div className="flex items-center justify-end gap-[75px]">
          <button type="button" onClick={close} className="text-[clamp(18px,1.62vw,28px)] text-muted">
            Trở lại
          </button>
          <button
            type="button"
            onClick={close}
            className="h-[75px] w-[min(256px,50%)] rounded-[5px] border-2 border-black bg-line text-[clamp(18px,1.62vw,28px)] text-white [text-shadow:0_4px_20px_#000]"
          >
            Hoàn thành
          </button>
        </div>
      </div>
    </dialog>
  );
}
