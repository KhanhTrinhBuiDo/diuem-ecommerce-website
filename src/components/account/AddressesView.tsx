"use client";

import { useState } from "react";
import { mockAddresses, type Address } from "@/data/account";

type Form = { id: string | null; name: string; phone: string; line: string };
const BLANK: Form = { id: null, name: "", phone: "", line: "" };
const PHONE_RE = /^(0|\+84)\d{9}$/;

/**
 * Figma "Sổ địa chỉ". Thao tác chỉ trên trình duyệt (chưa lưu).
 * TODO(supabase): bảng `addresses` (user_id, name, phone, province, ward, line, is_default) + ràng buộc 1 địa chỉ mặc định/người.
 * TODO(address): chọn Tỉnh/Phường từ danh mục hành chính mới (Figma ghi "cập nhật theo thông tin hành chính mới").
 */
export function AddressesView() {
  const [list, setList] = useState<Address[]>(mockAddresses);
  const [form, setForm] = useState<Form | null>(null);
  const [err, setErr] = useState<Partial<Record<keyof Form, string>>>({});

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const er: typeof err = {};
    if (!form.name.trim()) er.name = "Vui lòng nhập họ tên";
    if (!PHONE_RE.test(form.phone.replace(/\s/g, ""))) er.phone = "Số điện thoại không hợp lệ";
    if (!form.line.trim()) er.line = "Vui lòng nhập địa chỉ";
    setErr(er);
    if (Object.keys(er).length) return;
    setList((l) =>
      form.id
        ? l.map((a) => (a.id === form.id ? { ...a, name: form.name.trim(), phone: form.phone.trim(), line: form.line.trim() } : a))
        : [...l, { id: `a${Date.now()}`, name: form.name.trim(), phone: form.phone.trim(), line: form.line.trim(), isDefault: l.length === 0 }],
    );
    setForm(null);
  }

  const setDefault = (id: string) => setList((l) => l.map((a) => ({ ...a, isDefault: a.id === id })));
  const remove = (id: string) => setList((l) => l.filter((a) => a.id !== id));

  const input = "h-12 w-full rounded-[5px] border border-black bg-white px-4 text-[clamp(14px,1.04vw,18px)] font-light";

  return (
    <div className="flex flex-col gap-[35px]">
      {list.length === 0 && <p className="text-[clamp(14px,1.04vw,18px)] font-light">Bạn chưa có địa chỉ nào.</p>}
      {list.map((a) => (
        <article key={a.id} className="border border-black py-5">
          <div className="px-5 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] sm:px-[30px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex flex-wrap items-center gap-x-5">
                <strong className="text-[clamp(16px,1.27vw,22px)]">{a.name}</strong>
                <span aria-hidden="true" className="text-2xl opacity-50">|</span>
                <span className="text-[clamp(14px,1.16vw,20px)] text-black/50">{a.phone}</span>
              </p>
              <p className="flex items-center gap-3 text-[13px] text-line underline">
                <button type="button" onClick={() => setForm({ id: a.id, name: a.name, phone: a.phone, line: a.line })} className="underline">
                  Cập nhật
                </button>
                {!a.isDefault && (
                  <>
                    <span aria-hidden="true" className="no-underline">|</span>
                    <button type="button" onClick={() => remove(a.id)} className="underline">
                      Xóa
                    </button>
                  </>
                )}
              </p>
            </div>
            <p className="mt-2.5 border-b-2 border-rule pb-3 text-[clamp(14px,1.04vw,18px)]">{a.line}</p>
          </div>
          <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-[30px]">
            {a.isDefault ? (
              <span className="rounded-[5px] border-2 border-line px-10 py-2.5 text-[clamp(14px,1.04vw,18px)] font-light text-line">Mặc định</span>
            ) : (
              <span />
            )}
            <button
              type="button"
              disabled={a.isDefault}
              onClick={() => setDefault(a.id)}
              className="rounded-[5px] border-2 border-black px-8 py-2.5 text-[clamp(14px,1.04vw,18px)] font-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              Thiết lập mặc định
            </button>
          </div>
        </article>
      ))}

      {form && (
        <form onSubmit={save} noValidate className="flex flex-col gap-4 border border-black p-5 sm:p-[30px]">
          <h2 className="text-[clamp(16px,1.27vw,22px)] font-bold">{form.id ? "Cập nhật địa chỉ" : "Thêm địa điểm"}</h2>
          {(
            [
              ["name", "Họ và tên", "text"],
              ["phone", "Số điện thoại", "tel"],
              ["line", "Địa chỉ nhận hàng", "text"],
            ] as const
          ).map(([k, label, type]) => (
            <div key={k} className="flex flex-col gap-1.5">
              <label htmlFor={`ad-${k}`} className="text-sm">{label}</label>
              <input id={`ad-${k}`} type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={err[k] ? true : undefined} className={input} />
              {err[k] && <p role="alert" className="text-sm text-red-600">{err[k]}</p>}
            </div>
          ))}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setForm(null); setErr({}); }} className="h-[42px] rounded-[5px] border-2 border-black px-6 font-light">
              Hủy
            </button>
            <button type="submit" className="h-[42px] rounded-[5px] bg-black px-6 font-bold text-white">
              Lưu
            </button>
          </div>
        </form>
      )}

      <div className="flex justify-end">
        <button type="button" onClick={() => { setErr({}); setForm(BLANK); }} className="h-[42px] rounded-[5px] border-2 border-black bg-black px-10 text-[clamp(14px,1.04vw,18px)] font-bold text-white [text-shadow:0_4px_10px_rgba(0,0,0,0.5)]">
          Thêm Địa điểm
        </button>
      </div>
    </div>
  );
}
